import { randomUUID, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (process.env.FLW_MODE !== "test" || process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Live payment processing is not enabled." }, { status: 503 });
  }
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers.get("verif-hash") || "";
  if (!secretHash || !signature || !constantTimeEqual(signature, secretHash)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Billing database is not configured." }, { status: 503 });

  try {
    const payload = await req.json();
    const transactionId = payload?.data?.id;
    const reference = payload?.data?.tx_ref;
    if (!reference || !transactionId) return NextResponse.json({ received: true });

    const { data: payment, error } = await supabase.from("payment_events").select("*").eq("provider", "flutterwave").eq("provider_reference", reference).maybeSingle();
    if (error || !payment) return NextResponse.json({ received: true });
    if (payment.status === "paid" || payment.status === "refunded") return NextResponse.json({ received: true });

    const verificationResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      signal: AbortSignal.timeout(12000),
    });
    const verification = await verificationResponse.json();
    const transaction = verification?.data;
    const eventId = `charge:${String(transactionId)}:${String(transaction?.status || "unknown")}`;
    if (!verificationResponse.ok || verification?.status !== "success" || !transaction) {
      return NextResponse.json({ error: "Transaction verification is temporarily unavailable." }, { status: 503 });
    }

    if (transaction.status === "refunded") {
      await supabase.from("payment_events").update({ status: "refunded", provider_event_id: eventId, payload: { event: "refund_verified" }, updated_at: new Date().toISOString() }).eq("id", payment.id);
      await supabase.from("subscriptions").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("provider_reference", reference);
      return NextResponse.json({ received: true });
    }

    const expectedAmount = Number(payment.amount_minor) / 100;
    const exactPayment = transaction.status === "successful"
      && transaction.tx_ref === reference
      && transaction.currency === payment.currency
      && Number(transaction.amount) === expectedAmount
      && transaction.payment_type === "bank_transfer";
    if (!exactPayment) {
      await supabase.from("payment_events").update({ status: "processing", provider_event_id: eventId, payload: { event: "verification_mismatch" }, updated_at: new Date().toISOString() }).eq("id", payment.id);
      return NextResponse.json({ received: true });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
    const { error: entitlementError } = await supabase.from("subscriptions").upsert({
      id: randomUUID(), user_id: payment.user_id, restaurant_id: payment.restaurant_id,
      plan: payment.plan, status: "active", provider: "flutterwave", provider_reference: reference,
      mode: "test",
      currency: payment.currency, amount_minor: payment.amount_minor,
      current_period_start: now.toISOString(), current_period_end: periodEnd.toISOString(), updated_at: now.toISOString(),
    }, { onConflict: "provider_reference" });
    if (entitlementError) throw entitlementError;

    const { error: paymentError } = await supabase.from("payment_events").update({
      status: "paid", provider_event_id: eventId, payload: { event: "charge_verified" }, updated_at: now.toISOString(),
    }).eq("id", payment.id);
    if (paymentError) throw paymentError;
    return NextResponse.json({ received: true });
  } catch {
    console.error("[Payments] A Flutterwave webhook could not be processed.");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 503 });
  }
}

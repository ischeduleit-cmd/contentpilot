import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseUser, getSupabaseServerClient, verifyRestaurantOwner } from "@/lib/supabase";
import { PLANS, PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

function amountForPlan(plan: "grow" | "pro") {
  return PLANS[plan].monthlyNgn;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedSupabaseUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Billing database is not configured." }, { status: 503 });
  if (process.env.FLW_MODE !== "test" || process.env.VERCEL_ENV === "production" || !process.env.FLW_SECRET_KEY || !process.env.FLW_SECRET_HASH) {
    return NextResponse.json({ error: "Test bank-transfer checkout is not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const plan = body.plan as PlanId;
    const restaurantId = typeof body.restaurantId === "string" ? body.restaurantId : "";
    if (plan !== "grow" && plan !== "pro") return NextResponse.json({ error: "Choose Grow or Pro." }, { status: 400 });
    const access = await verifyRestaurantOwner(req, restaurantId);
    if (!access.user || !access.restaurant) return NextResponse.json({ error: "Workspace access denied." }, { status: access.status });
    const amountNgn = amountForPlan(plan);
    if (!amountNgn) return NextResponse.json({ error: "This plan cannot be purchased." }, { status: 400 });

    const reference = `cp_${randomUUID().replace(/-/g, "")}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const paymentId = randomUUID();
    const { error: insertError } = await supabase.from("payment_events").insert({
      id: paymentId,
      provider: "flutterwave",
      mode: "test",
      provider_event_id: `checkout:${reference}`,
      provider_reference: reference,
      user_id: user.id,
      restaurant_id: restaurantId,
      plan,
      amount_minor: Math.round(amountNgn * 100),
      currency: "NGN",
      status: "pending",
      expires_at: expiresAt,
      payload: { event: "checkout_created" },
    });
    if (insertError) throw insertError;

    const response = await fetch("https://api.flutterwave.com/v3/charges?type=bank_transfer", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: reference,
        amount: amountNgn.toFixed(2),
        currency: "NGN",
        email: user.email,
        narration: `ContentPilot ${PLANS[plan].name} monthly plan`,
        bank_transfer_options: { expires: 3600 },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    const transfer = result?.meta?.authorization;
    if (!response.ok || result?.status !== "success" || !transfer?.transfer_account || !transfer?.transfer_bank) {
      await supabase.from("payment_events").update({ status: "failed", payload: { event: "charge_creation_failed" }, updated_at: new Date().toISOString() }).eq("id", paymentId).eq("user_id", user.id);
      return NextResponse.json({ error: "The bank transfer could not be created. Please try again." }, { status: 502 });
    }

    const { error: updateError } = await supabase.from("payment_events").update({ status: "awaiting_transfer", updated_at: new Date().toISOString() }).eq("id", paymentId).eq("user_id", user.id);
    if (updateError) throw updateError;
    return NextResponse.json({
      payment: { id: paymentId, reference, plan, amount: amountNgn, currency: "NGN", status: "awaiting_transfer", expiresAt: transfer.account_expiration || expiresAt },
      transfer: { bank: transfer.transfer_bank, accountNumber: transfer.transfer_account, accountName: transfer.transfer_note || "Flutterwave transfer account", amount: Number(transfer.transfer_amount || amountNgn) },
    });
  } catch {
    console.error("[Payments] Could not create test transfer.");
    return NextResponse.json({ error: "We could not create the transfer. No payment has been verified." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedSupabaseUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Billing database is not configured." }, { status: 503 });
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
  const { data, error } = await supabase.from("payment_events").select("provider_reference,plan,currency,amount_minor,status,expires_at").eq("provider_reference", reference).eq("user_id", user.id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  let status = data.status;
  if (["pending", "awaiting_transfer", "processing"].includes(status) && data.expires_at && Date.parse(data.expires_at) <= Date.now()) {
    status = "expired";
    await supabase.from("payment_events").update({ status, updated_at: new Date().toISOString() }).eq("provider_reference", reference).eq("user_id", user.id);
  }
  return NextResponse.json({ payment: { reference, plan: data.plan, status, currency: data.currency, amount: Number(data.amount_minor) / 100 } });
}

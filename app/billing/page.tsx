"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Clock3, Copy, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { PLANS, PlanId } from "@/lib/plans";

type Checkout = {
  payment: { id: string; reference: string; plan: PlanId; amount: number; currency: string; status: string; expiresAt: string };
  transfer: { bank: string; accountNumber: string; accountName: string; amount: number };
};

function BillingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = (params.get("plan") || "grow") as PlanId;
  const [checkout, setCheckout] = React.useState<Checkout | null>(null);
  const [status, setStatus] = React.useState("starting");
  const [message, setMessage] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(true);

  React.useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    async function start() {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
      if (!session) { router.replace(`/login?next=${encodeURIComponent(`/billing?plan=${plan}`)}`); return; }
      const profileResponse = await authenticatedFetch("/api/onboarding");
      const profile = await profileResponse.json();
      if (!profileResponse.ok || !profile.restaurant?.id) { router.replace(`/onboarding?plan=${plan}`); return; }
      if (plan !== "grow" && plan !== "pro") { router.replace("/app"); return; }
      const response = await authenticatedFetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, restaurantId: profile.restaurant.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Transfer checkout is unavailable.");
      if (!live) return;
      setCheckout(result);
      setStatus(result.payment.status);
      setBusy(false);
      timer = setInterval(async () => {
        const poll = await authenticatedFetch(`/api/payments?reference=${encodeURIComponent(result.payment.reference)}`);
        const value = await poll.json();
        if (!poll.ok || !live) return;
        setStatus(value.payment.status);
        if (["paid", "expired", "failed", "refunded"].includes(value.payment.status) && timer) clearInterval(timer);
      }, 5000);
    }
    start().catch((error) => { if (live) { setMessage(error.message || "We couldn't start checkout."); setBusy(false); } });
    return () => { live = false; if (timer) clearInterval(timer); };
  }, [router, plan]);

  const copyAccount = async () => {
    if (!checkout) return;
    await navigator.clipboard.writeText(checkout.transfer.accountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-[75vh] bg-black px-4 py-12 text-white sm:px-6">
      <section className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} /> Pricing</Link>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Secure bank transfer</p>
        <h1 className="text-3xl font-semibold tracking-tight">Start your {PLANS[plan]?.name || "Grow"} plan</h1>
        <p className="mt-3 text-zinc-400">Your paid access begins only after Flutterwave verifies the transfer.</p>

        {busy && <div className="mt-8 flex items-center gap-3 rounded-xl border border-zinc-800 p-5 text-zinc-300"><LoaderCircle className="animate-spin" size={18} /> Preparing a unique transfer destination…</div>}
        {message && <div role="alert" className="mt-8 rounded-xl border border-amber-800 bg-amber-950/30 p-5 text-sm text-amber-100">{message}<p className="mt-2 text-amber-200/70">No payment was verified or started. You can try again later.</p></div>}

        {checkout && <div className="mt-8 space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div><p className="text-sm text-zinc-400">{PLANS[checkout.payment.plan].name} · monthly</p><p className="mt-1 text-2xl font-semibold">₦{checkout.transfer.amount.toLocaleString("en-NG")}</p></div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${status === "paid" ? "bg-emerald-950 text-emerald-300" : "bg-zinc-800 text-zinc-300"}`}>
                {status === "paid" ? <Check size={14} /> : <Clock3 size={14} />}{status === "paid" ? "Transfer verified" : status.replaceAll("_", " ")}
              </span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-zinc-500">Bank</dt><dd className="mt-1 font-medium">{checkout.transfer.bank}</dd></div>
              <div><dt className="text-zinc-500">Account name</dt><dd className="mt-1 font-medium">{checkout.transfer.accountName}</dd></div>
            </dl>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-black px-4 py-3">
              <div><p className="text-xs text-zinc-500">Transfer account number</p><p className="mt-1 font-mono text-lg tracking-wider">{checkout.transfer.accountNumber}</p></div>
              <Button type="button" variant="outline" onClick={copyAccount} className="min-h-11 gap-2">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</Button>
            </div>
            <p className="mt-4 text-xs text-zinc-500">Use the exact amount and complete the transfer before {new Date(checkout.payment.expiresAt).toLocaleString()}.</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-zinc-300" /><p>We check the payment directly with the provider. This page updates when the transfer is confirmed; sending proof does not activate a plan.</p></div>
          {status === "paid" && <Button onClick={() => router.replace("/app")} className="w-full min-h-12">Open your workspace</Button>}
          {status === "expired" && <p className="rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300">This transfer destination expired. Return to pricing to create a new transfer.</p>}
          <p className="text-center text-xs text-zinc-600">Reference: {checkout.payment.reference}</p>
        </div>}
        <p className="mt-10 text-xs leading-5 text-zinc-600">Plans are billed monthly in Nigerian naira. Paid access starts only after the provider confirms the exact amount.</p>
      </section>
    </main>
  );
}

export default function BillingPage() {
  return <React.Suspense fallback={<main className="min-h-[75vh] bg-black px-4 py-12 text-white sm:px-6"><div className="mx-auto max-w-2xl text-sm text-zinc-400">Preparing checkout…</div></main>}><BillingContent /></React.Suspense>;
}

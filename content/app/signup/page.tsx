"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, CheckCircle2, UserRoundPlus } from "lucide-react";
import { BUSINESS_GOALS, PRIMARY_ACTIONS, RESTAURANT_TYPES } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { saveStoredRestaurantProfile } from "@/lib/onboarding-store";

type FormData = {
  restaurantName: string; location: string; restaurantType: string; targetAudience: string;
  primaryCustomerAction: string; businessDescription: string; goal: string; goalDescription: string;
  email: string; password: string; confirmPassword: string;
};
const WELCOME_MESSAGE = "Welcome to ContentPilot! Your restaurant workspace is ready. Let’s build a content strategy that turns your content into business growth.";

const initial: FormData = { restaurantName: "", location: "", restaurantType: "restaurant", targetAudience: "", primaryCustomerAction: "order_food", businessDescription: "", goal: "get_more_orders", goalDescription: BUSINESS_GOALS[0].description, email: "", password: "", confirmPassword: "" };

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = React.useState(initial);
  const [stage, setStage] = React.useState<"register" | "verify" | "success">("register");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [resendAt, setResendAt] = React.useState(0);
  const [signedInEmail, setSignedInEmail] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const checkExistingSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
      if (!active || !session?.access_token) return;
      const { data: { user } } = await supabase!.auth.getUser(session.access_token);
      if (active && user) setSignedInEmail(user.email || "an existing account");
    };
    void checkExistingSession();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setCooldown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))), 500);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const change = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const startCooldown = () => setResendAt(Date.now() + 60_000);
  const register = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    const email = form.email.trim().toLowerCase();
    if (!form.restaurantName.trim() || !form.location.trim() || !form.targetAudience.trim() || !form.businessDescription.trim()) { setError("Complete all restaurant details before continuing."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("The passwords do not match. Please ensure both passwords match."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError("Sign-up is not configured. Please try again later."); return; }
    setBusy(true);
    try {
      if (signedInEmail && signedInEmail.toLowerCase() !== email) {
        await supabase.auth.signOut({ scope: "local" });
        setSignedInEmail("");
      }
      const goal = BUSINESS_GOALS.find((item) => item.id === form.goal);
      const response = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: form.restaurantName, location: form.location, restaurantType: form.restaurantType,
          targetAudience: form.targetAudience, primaryCustomerAction: form.primaryCustomerAction,
          businessDescription: form.businessDescription, goal: form.goal, goalDescription: goal?.description || form.goalDescription,
          email, password: form.password, confirmPassword: form.confirmPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "signup_failed");

      // Sign in with password to immediately establish browser session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (signInError) {
        setNotice("Account created successfully. Please sign in to open your workspace.");
        window.setTimeout(() => router.replace(`/login?email=${encodeURIComponent(email)}`), 1200);
        return;
      }

      if (result.restaurant) {
        saveStoredRestaurantProfile(result.restaurant);
      }

      setNotice(WELCOME_MESSAGE);
      setStage("success");
      window.setTimeout(() => router.replace("/app"), 2000);
    } catch (err) {
      setError(err instanceof Error && err.message !== "signup_failed" ? err.message : "We could not start registration. Check your details or sign in if you already have an account.");
    } finally { setBusy(false); }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) { setError("Enter the six-digit code from your email."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError("Verification is not configured. Please try again later."); return; }
    setBusy(true);
    let didVerify = verified;
    try {
      if (!verified) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({ email: form.email.trim().toLowerCase(), token: cleanCode, type: "signup" });
        if (verifyError) {
          const message = verifyError.message.toLowerCase();
          setError(
            message.includes("expired")
              ? "That code has expired. Request a new code and try again."
              : message.includes("rate limit") || message.includes("too many")
              ? "Too many verification attempts. Please wait a moment or request a new code."
              : "That code is incorrect or has already been used. Check it or request a new code."
          );
          return;
        }
        if (!data.user || data.user.email?.trim().toLowerCase() !== form.email.trim().toLowerCase()) {
          throw new Error("verified_user_mismatch");
        }
        setVerified(true);
        didVerify = true;
      }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (userError || !user || user.email?.trim().toLowerCase() !== form.email.trim().toLowerCase() || !session?.access_token) throw new Error("verified_session_missing");
      const selectedGoal = BUSINESS_GOALS.find((item) => item.id === form.goal);
      const response = await authenticatedFetch("/api/onboarding", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantName: form.restaurantName.trim(), location: form.location.trim(), restaurantType: form.restaurantType, targetAudience: form.targetAudience.trim(), primaryCustomerAction: form.primaryCustomerAction, businessDescription: form.businessDescription.trim(), goal: form.goal, goalDescription: selectedGoal?.description || "", weekStart: new Date().toISOString().slice(0, 10) }),
      });
      if (!response.ok) throw new Error("profile_save_failed");
      const completion = await response.json();
      setNotice(WELCOME_MESSAGE);
      setStage("success");
      window.setTimeout(() => router.replace("/app"), 2000);
    } catch {
      setError(didVerify ? "Your email is verified, but we could not finish saving the workspace. Retry to complete setup." : "We could not verify that code. Check it or request a new one.");
    } finally { setBusy(false); }
  };

  const resend = async () => {
    if (cooldown) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resendError } = await supabase!.auth.resend({ type: "signup", email: form.email.trim().toLowerCase() });
      if (resendError) throw resendError;
      setNotice("If registration is still pending, a new code will arrive shortly."); startCooldown(); setCode("");
    } catch { setError("We could not resend the code yet. Please wait a moment and try again."); startCooldown(); }
    finally { setBusy(false); }
  };

  const inputClass = "w-full rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-[#b9513a] focus:ring-2 focus:ring-[#b9513a]/20";
  const field = (label: string, key: keyof FormData, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label className="block space-y-1.5 text-sm font-medium text-black">{label}<input className={inputClass} value={form[key]} onChange={(e) => change(key, e.target.value)} {...props} /></label>;

  return <main className="min-h-[68vh] flex-1 bg-black px-4 py-10 text-white selection:bg-white selection:text-black sm:py-14">
    <section className={`mx-auto w-full space-y-8 rounded-xl border-2 border-[#b9513a] bg-white p-7 text-black shadow-[0_12px_30px_rgba(123,59,38,0.09)] sm:p-10 ${stage === "register" ? "max-w-3xl" : "max-w-md"}`}>
      <div className="space-y-3 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#b9513a] text-white">{stage === "success" ? <CheckCircle2 size={20} /> : <UserRoundPlus size={20} />}</span>
        <h1 className="font-serif text-3xl text-black">{stage === "register" ? "Create your workspace" : stage === "verify" ? "Check your email" : "Welcome to ContentPilot!"}</h1>
        <p className="text-sm leading-6 text-black/80">{stage === "register" ? "Add your restaurant and account details to get started." : stage === "verify" ? `Enter the six-digit code sent to ${form.email}. Codes expire after 15 minutes.` : WELCOME_MESSAGE}</p>
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}
      {notice && <p role="status" className="rounded-md border border-[#b9513a]/30 bg-[#b9513a]/10 p-3.5 text-sm font-medium text-black">{notice}</p>}
      {stage === "register" && signedInEmail && <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><p>This browser already has a verified session for {signedInEmail}. That session is separate from this registration and may already have workspace access.</p><button type="button" className="mt-2 font-semibold underline" onClick={async () => { await getSupabaseBrowserClient()?.auth.signOut({ scope: "local" }); setSignedInEmail(""); }}>Sign out of this browser before testing a new account</button></div>}
      {stage === "register" && <form onSubmit={register} className="space-y-6">
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-black">Restaurant information</legend>
          {field("Restaurant name", "restaurantName", { required: true, maxLength: 255, autoComplete: "organization" })}
          {field("Location", "location", { required: true, maxLength: 255, placeholder: "City, neighborhood" })}
          <label className="block space-y-1.5 text-sm font-medium text-black">Restaurant type<select className={inputClass} value={form.restaurantType} onChange={(e) => change("restaurantType", e.target.value)}>{RESTAURANT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="block space-y-1.5 text-sm font-medium text-black">Target customers<textarea className={inputClass} required maxLength={1000} rows={2} value={form.targetAudience} onChange={(e) => change("targetAudience", e.target.value)} /></label>
          <label className="block space-y-1.5 text-sm font-medium text-black">Desired customer action<select className={inputClass} value={form.primaryCustomerAction} onChange={(e) => change("primaryCustomerAction", e.target.value)}>{PRIMARY_ACTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="block space-y-1.5 text-sm font-medium text-black">Weekly business goal<select className={inputClass} value={form.goal} onChange={(e) => change("goal", e.target.value)}>{BUSINESS_GOALS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="block space-y-1.5 text-sm font-medium text-black sm:col-span-2">Business description<textarea className={inputClass} required maxLength={5000} rows={3} value={form.businessDescription} onChange={(e) => change("businessDescription", e.target.value)} placeholder="Describe your food, service, and what makes the restaurant distinctive." /></label>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-black">Account information</legend>
          {field("Email address", "email", { required: true, type: "email", autoComplete: "email", maxLength: 255 })}
          {field("Password", "password", { required: true, type: "password", autoComplete: "new-password", minLength: 8 })}
          {field("Confirm password", "confirmPassword", { required: true, type: "password", autoComplete: "new-password", minLength: 8 })}
        </fieldset>
        <button type="submit" disabled={busy} style={{ backgroundColor: "#ffffff", color: "#2b2a25" }} className="w-full min-h-[48px] rounded-lg border-2 border-[#b9513a] bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#2b2a25] shadow-[0_2px_0_rgba(70,35,23,0.08)] transition-all duration-150 hover:bg-[#b9513a] hover:text-[#ffffff] hover:shadow-[0_5px_13px_rgba(92,48,32,0.15)] hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none cursor-pointer">{busy ? "Creating account…" : "Create account"}</button>
      </form>}
      {stage === "verify" && <form onSubmit={verify} className="space-y-4">
        <label htmlFor="verification-code" className="block text-sm font-medium text-black">Six-digit verification code</label>
        <input id="verification-code" className={`${inputClass} text-center text-xl tracking-[0.5em]`} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required aria-describedby="otp-help" />
        <p id="otp-help" className="text-xs text-zinc-500">If it expires, request another code. Supabase also enforces its configured verification and rate limits.</p>
        <button type="submit" disabled={busy} className="w-full min-h-[48px] rounded-lg border border-[#b9513a] bg-[#b9513a] px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_0_rgba(70,35,23,0.08)] transition-all duration-150 hover:bg-[#963d2b] hover:shadow-[0_5px_13px_rgba(92,48,32,0.15)] disabled:opacity-60 cursor-pointer">{busy ? "Verifying…" : verified ? "Retry workspace setup" : "Verify and open workspace"}</button>
        <button type="button" onClick={resend} disabled={busy || cooldown > 0} className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50">{cooldown ? `Resend code in ${cooldown}s` : "Resend code"}</button>
        <button type="button" onClick={() => { setStage("register"); setCode(""); setError(""); setNotice(""); }} className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black"><ArrowLeft size={15} /> Return to edit registration</button>
      </form>}
      <p className="text-center text-sm text-[#ffffff]" style={{ color: "#ffffff" }}>Already have a workspace? <Link className="font-semibold text-[#ffffff] underline-offset-4 hover:underline" style={{ color: "#ffffff" }} href="/login">Sign in</Link></p>
    </section>
  </main>;
}

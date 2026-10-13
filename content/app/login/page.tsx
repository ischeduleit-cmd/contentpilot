"use client";

import * as React from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const [next, setNext] = React.useState("/app");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested?.startsWith("/") && !requested.startsWith("//")) setNext(requested);
  }, []);
  return (
    <main className="flex min-h-[68vh] flex-1 items-center justify-center bg-black px-4 py-12 text-white selection:bg-white selection:text-black">
      <section className="w-full max-w-md space-y-7 rounded-xl border border-zinc-200 bg-white p-7 text-zinc-900 shadow-sm sm:p-9">
        <div className="space-y-3 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#b9513a] text-white"><LogIn size={20} aria-hidden="true" /></span>
          <h1 className="font-serif text-3xl">Welcome back</h1>
          <p className="text-sm leading-6 text-zinc-600">Sign in with your email and password or continue with Google.</p>
        </div>
        <form className="space-y-3" onSubmit={async (event) => {
          event.preventDefault(); setError(""); setBusy(true);
          try {
            const supabase = getSupabaseBrowserClient();
            if (!supabase) throw new Error("not_configured");
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
            if (signInError) throw signInError;
            window.location.assign(next);
          } catch (err) {
            const msg = err instanceof Error ? err.message.toLowerCase() : "";
            setError(
              msg.includes("invalid") || msg.includes("credentials") || msg.includes("password")
                ? "Incorrect email or password combination. Check your details and try again."
                : "We could not sign you in. Check your email and password."
            );
          }
          finally { setBusy(false); }
        }}>
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}
          <label className="block space-y-1.5 text-sm font-medium text-zinc-800">Email address<input className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-zinc-900" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block space-y-1.5 text-sm font-medium text-zinc-800">Password<input className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-zinc-900" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button disabled={busy} className="w-full rounded-md bg-[#963d2b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200" />OR<span className="h-px flex-1 bg-zinc-200" /></div>
        <GoogleAuthButton next={next} />
        <p className="text-center text-sm text-zinc-600">New to ContentPilot? <Link className="font-semibold text-[#963d2b] underline-offset-4 hover:underline" href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}

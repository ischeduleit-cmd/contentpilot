"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function GoogleAuthButton({ next = "/app" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const continueWithGoogle = async () => {
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Google sign-in is not configured yet. Please try again later.");
      return;
    }
    setLoading(true);
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), queryParams: { prompt: "select_account" } },
    });
    if (oauthError) {
      setError("Google sign-in could not start. Please try again.");
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="space-y-2">
      <button type="button" onClick={continueWithGoogle} disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60">
        <Chrome size={17} aria-hidden="true" />
        <span>{loading ? "Connecting to Google…" : "Continue with Google"}</span>
      </button>
      {error && <p role="alert" className="text-center text-sm text-red-700">{error}</p>}
    </div>
  );
}

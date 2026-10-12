"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { saveStoredRestaurantProfile } from "@/lib/onboarding-store";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = React.useState("Finishing Google sign-in…");

  React.useEffect(() => {
    let active = true;
    const complete = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage("Sign-in is not configured. Please contact the workspace administrator.");
        return;
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error || !session?.access_token) {
        setMessage("Google sign-in was not completed. Return to sign-in and try again.");
        return;
      }

      try {
        const response = await fetch("/api/onboarding", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!active) return;
        if (response.ok) {
          const result = await response.json();
          if (result.restaurant) saveStoredRestaurantProfile(result.restaurant);
          const destination = safeNext(params.get("next"));
          const target = destination.startsWith("/onboarding") && new URLSearchParams(destination.split("?")[1] || "").has("plan")
            ? `/billing?plan=${new URLSearchParams(destination.split("?")[1] || "").get("plan")}`
            : destination;
          router.replace(target);
        } else if (response.status === 404) {
          router.replace(safeNext(params.get("next")).startsWith("/onboarding") ? safeNext(params.get("next")) : "/onboarding");
        } else {
          setMessage("We could not load your restaurant workspace. Please try again.");
        }
      } catch {
        if (active) setMessage("We could not connect to your workspace. Please try again.");
      }
    };
    complete();
    return () => { active = false; };
  }, [params, router]);

  return <main className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-zinc-700" role="status">{message}</main>;
}

export default function AuthCallbackPage() {
  return <React.Suspense fallback={<main className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-zinc-700" role="status">Finishing sign-in…</main>}><AuthCallbackContent /></React.Suspense>;
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStoredRestaurantProfile,
  getStoredUser,
  saveStoredUser,
} from "@/lib/onboarding-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Save user session
      const existingUser = getStoredUser();
      const userId = existingUser && existingUser.email === cleanEmail ? existingUser.id : crypto.randomUUID();
      saveStoredUser({ id: userId, email: cleanEmail });

      // Check if user has an existing restaurant in local store or backend
      const localProfile = getStoredRestaurantProfile();
      let hasRestaurant = Boolean(localProfile && localProfile.name);

      if (!hasRestaurant) {
        // Query backend for existing restaurant associated with this user/email
        try {
          const res = await fetch(`/api/onboarding?userId=${userId}`);
          const data = await res.json();
          if (data.success && data.restaurant) {
            hasRestaurant = true;
          }
        } catch {
          // Ignore network error on check
        }
      }

      setTimeout(() => {
        if (hasRestaurant) {
          router.push("/app");
        } else {
          router.push("/onboarding");
        }
      }, 300);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 bg-black text-white selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
            <Lock className="w-3.5 h-3.5 text-zinc-300" />
            <span>ACCOUNT LOGIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
            Sign in to ContentPilot
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Access your personalized restaurant workspace, content library, and weekly strategy.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
          {error && (
            <div className="p-3 border border-red-800 bg-red-950/40 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Email Address</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@yourrestaurant.com"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs focus:border-white focus:ring-0"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs focus:border-white focus:ring-0"
              />
            </div>

            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="w-full font-mono text-xs gap-1.5 h-10"
            >
              <span>{isSubmitting ? "Signing in..." : "Sign in to Workspace"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-2">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Return to Overview
          </Link>
          <Link href="/signup" className="hover:text-white transition-colors">
            Need an account? Start Free &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

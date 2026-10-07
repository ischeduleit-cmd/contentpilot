"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, ShieldCheck, Lock, Mail, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("ovie@ovieskitchen.com");
  const [password, setPassword] = React.useState("••••••••••••");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Authenticated session redirect
    setTimeout(() => {
      router.push("/app");
    }, 400);
  };

  const handleDemoAccess = () => {
    setIsSubmitting(true);
    router.push("/app");
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 bg-black text-white selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
            <Lock className="w-3.5 h-3.5 text-zinc-300" />
            <span>OPERATOR AUTHENTICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
            Access Your Workspace
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Manage your restaurant content library, weekly goals, and conversion strategies.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Operator Email</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@restaurant.com"
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
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Main App"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* 1-Click Benchmark Demo Access */}
          <div className="pt-4 border-t border-zinc-900 space-y-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-center">
              Or Fast-Track via Benchmark Workspace
            </div>

            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full p-3 border border-zinc-800 bg-black hover:border-zinc-500 text-left transition-all group flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ovie&apos;s Kitchen (Akure)</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Pre-configured workspace with storage bucket &amp; weekly strategy
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-2">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Return to Overview
          </Link>
          <Link href="/signup" className="hover:text-white transition-colors">
            Register new restaurant &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

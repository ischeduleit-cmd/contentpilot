"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, UserPlus, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveStoredUser,
  saveStoredRestaurantProfile,
  getStoredRestaurantProfile,
} from "@/lib/onboarding-store";

export default function SignUpPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = restaurantName.trim();
    const cleanLocation = location.trim();

    if (!cleanEmail || !cleanName || !cleanLocation) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userId = crypto.randomUUID();
      saveStoredUser({ id: userId, email: cleanEmail });

      const existingProfile = getStoredRestaurantProfile();
      saveStoredRestaurantProfile({
        ...(existingProfile || {}),
        name: cleanName,
        location: cleanLocation,
        restaurantType: existingProfile?.restaurantType || "restaurant",
        targetAudience: existingProfile?.targetAudience || "",
        primaryCustomerAction: existingProfile?.primaryCustomerAction || "order_food",
        businessDescription: existingProfile?.businessDescription || "",
      });

      setTimeout(() => {
        router.push("/onboarding");
      }, 300);
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 bg-black text-white selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
            <UserPlus className="w-3.5 h-3.5 text-zinc-300" />
            <span>CREATE RESTAURANT ACCOUNT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
            Get Started with ContentPilot
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Create your account and build an AI-powered content strategy for your restaurant.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
          {error && (
            <div className="p-3 border border-red-800 bg-red-950/40 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-zinc-500" />
                <span>Restaurant Name</span>
              </label>
              <Input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. Bella Bistro"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs focus:border-white focus:ring-0"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>City &amp; Location</span>
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs focus:border-white focus:ring-0"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Account Email</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourrestaurant.com"
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
                placeholder="Create secure password"
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
              <span>{isSubmitting ? "Creating Account..." : "Create Account &amp; Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-2">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Return to Overview
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Already registered? Sign in &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

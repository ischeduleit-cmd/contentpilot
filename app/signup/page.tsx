"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, Store, Lock, Mail, UserPlus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveStoredRestaurantProfile } from "@/lib/onboarding-store";

export default function SignUpPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (restaurantName.trim() && location.trim()) {
      saveStoredRestaurantProfile({
        name: restaurantName.trim(),
        location: location.trim(),
        restaurantType: "restaurant",
        targetAudience: "Local diners & working professionals",
        primaryCustomerAction: "whatsapp_order",
      });
    }

    setTimeout(() => {
      router.push("/onboarding/goal");
    }, 400);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 bg-black text-white selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
            <UserPlus className="w-3.5 h-3.5 text-zinc-300" />
            <span>ESTABLISHMENT REGISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
            Create Your Restaurant Workspace
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Get autonomous content strategy tailored specifically for your kitchen.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-zinc-500" />
                <span>Restaurant / Kitchen Name</span>
              </label>
              <Input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. Mama Put Express"
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
                placeholder="e.g. Lekki Phase 1, Lagos"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs focus:border-white focus:ring-0"
              />
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Operator Email</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@kitchen.com"
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
                placeholder="Create password"
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
              <span>{isSubmitting ? "Creating Workspace..." : "Create Workspace &amp; Continue"}</span>
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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  MapPin,
  Users,
  Send,
  ArrowRight,
  CheckCircle2,
  Building2,
  Compass,
  ArrowLeft,
  Info,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RESTAURANT_TYPES,
  PRIMARY_ACTIONS,
} from "@/lib/constants";
import {
  OnboardingRestaurantForm,
  getStoredRestaurantProfile,
  saveStoredRestaurantProfile,
} from "@/lib/onboarding-store";

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = React.useState<OnboardingRestaurantForm>(() => {
    return (
      getStoredRestaurantProfile() || {
        name: "",
        location: "",
        restaurantType: "restaurant",
        targetAudience: "",
        primaryCustomerAction: "order_food",
        businessDescription: "",
      }
    );
  });

  const handleInputChange = (field: keyof OnboardingRestaurantForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      alert("Please provide at least a Restaurant Name and Location.");
      return;
    }
    saveStoredRestaurantProfile(formData);
    router.push("/onboarding/goal");
  };

  return (
    <div className="flex-1 bg-black text-white py-10 px-4 sm:px-6 selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Step Tracker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Restaurant Profile Setup
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Step 1 of 2: Define your establishment, local geography, and primary diner behavior.
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="p-3 border border-white bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-white text-black font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="font-semibold text-white">Restaurant Profile</span>
            </div>
            <Badge variant="default" className="text-[9px]">ACTIVE</Badge>
          </div>

          <div className="p-3 border border-zinc-800 bg-black/60 flex items-center justify-between text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-zinc-700 text-zinc-400 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Weekly Business Goal</span>
            </div>
            <span className="text-[10px] text-zinc-600">PENDING</span>
          </div>
        </div>

        {/* Main Grid: Form + Strategic Live Context */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 space-y-6 border border-zinc-800 bg-zinc-950 p-6">
            {/* Restaurant Name */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Restaurant / Brand Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Copper Pot Grill"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="font-sans text-sm"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Appears on all generated weekly calendar headers and exports.
              </p>
            </div>

            {/* Location & City */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Location (City, Neighborhood / Area) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Midtown Manhattan, New York"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
                className="font-sans text-sm"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Used to anchor authentic local references in captions and geotargeted hooks.
              </p>
            </div>

            {/* Restaurant Type */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Establishment Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                {RESTAURANT_TYPES.map((type) => {
                  const isSelected = formData.restaurantType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange("restaurantType", type.id)}
                      className={`p-2.5 text-left border transition-all ${
                        isSelected
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      <div className="text-[11px]">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Target Customers
              </label>
              <Textarea
                placeholder="e.g. Young professionals, corporate lunch crowds, weekend families, and food lovers."
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                rows={3}
                className="font-sans text-sm"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Dictates the tone, urgency, and posting time windows in the strategy engine.
              </p>
            </div>

            {/* Primary Customer Action */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Desired Customer Action
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                {PRIMARY_ACTIONS.map((action) => {
                  const isSelected = formData.primaryCustomerAction === action.id;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleInputChange("primaryCustomerAction", action.id)}
                      className={`p-2.5 text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px]">{action.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Business Description
              </label>
              <Textarea
                placeholder="e.g. Modern wood-fired pizzeria specializing in slow-fermented sourdough crusts, seasonal toppings, and craft cocktails."
                value={formData.businessDescription || ""}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                rows={3}
                className="font-sans text-sm"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Helps the AI craft authentic culinary angles and highlight your signature style.
              </p>
            </div>

            {/* Next Action */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">Saved to your workspace session</span>
              <Button type="submit" variant="default" size="lg" className="gap-2 font-mono text-xs">
                <span>Continue to Weekly Goal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Right Live Strategy Card: 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Compass className="w-3.5 h-3.5 text-zinc-400" />
                  <span>STRATEGY ENGINE CONTEXT</span>
                </div>
                <Badge variant="outline" className="text-[9px]">LIVE PREVIEW</Badge>
              </div>

              <div className="space-y-3 text-[11px] text-zinc-400 leading-relaxed font-sans">
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Establishment:</div>
                  <div className="text-white font-medium">
                    {formData.name || "Your Restaurant"} &bull; {formData.location || "Your Location"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Target Customers:</div>
                  <div className="text-zinc-300">
                    {formData.targetAudience || "Add your target diner demographics on the left."}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Primary Desired Action:</div>
                  <div className="text-zinc-300">
                    {PRIMARY_ACTIONS.find((a) => a.id === formData.primaryCustomerAction)?.label}
                  </div>
                </div>

                {formData.businessDescription && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Culinary Specialty:</div>
                    <div className="text-zinc-300 italic">
                      &ldquo;{formData.businessDescription}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border border-zinc-900 bg-black space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Info className="w-3 h-3 text-zinc-400" />
                  <span>Why this profile matters:</span>
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans text-[11px]">
                  ContentPilot does not generate generic food platitudes. Knowing your exact diner demographic ensures
                  a lunch dish is positioned around fast office delivery rather than leisurely weekend brunch.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

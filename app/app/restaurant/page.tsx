"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Utensils,
  Users,
  Send,
  Save,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RESTAURANT_TYPES,
  PRIMARY_ACTIONS,
} from "@/lib/constants";
import {
  getStoredRestaurantProfile,
  saveStoredRestaurantProfile,
  OnboardingRestaurantForm,
  getStoredUser,
} from "@/lib/onboarding-store";

export default function AppRestaurantPage() {
  const [formData, setFormData] = React.useState<OnboardingRestaurantForm>(() => {
    return (
      getStoredRestaurantProfile() || {
        name: "My Restaurant",
        location: "City Center",
        restaurantType: "restaurant",
        targetAudience: "Local diners & working professionals",
        primaryCustomerAction: "order_food",
        businessDescription: "",
      }
    );
  });

  const [isSaved, setIsSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleInputChange = (field: keyof OnboardingRestaurantForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    saveStoredRestaurantProfile(formData);

    try {
      const user = getStoredUser();
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          restaurantName: formData.name,
          location: formData.location,
          restaurantType: formData.restaurantType,
          targetAudience: formData.targetAudience,
          primaryCustomerAction: formData.primaryCustomerAction,
          businessDescription: formData.businessDescription,
        }),
      });
    } catch (err) {
      console.warn("Failed to update restaurant profile remotely:", err);
    } finally {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="flex-1 bg-black text-white p-4 sm:p-6 md:p-8 space-y-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Store className="w-3.5 h-3.5 text-zinc-400" />
              <span>ESTABLISHMENT PROFILE</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-bold">{formData.name || "Restaurant"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Restaurant Profile &amp; Audience
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              The culinary context and customer actions that shape your 7-day conversion schedule.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
          {/* Status Message */}
          {isSaved && (
            <div className="p-3 border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Restaurant profile saved successfully. Content strategist will use these parameters.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant Name */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
                <Store className="w-3.5 h-3.5 text-zinc-400" />
                <span>Restaurant Name</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Copper Pot Bistro"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs"
              />
              <p className="text-[11px] text-zinc-500 font-sans">
                The public commercial brand name used in copywriting hooks.
              </p>
            </div>

            {/* City / Location */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Location (City / Area)</span>
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g. Downtown Chicago, IL"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs"
              />
              <p className="text-[11px] text-zinc-500 font-sans">
                Injected into local hooks and geotargeted lunch rush copy.
              </p>
            </div>
          </div>

          {/* Establishment Type */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
              <Utensils className="w-3.5 h-3.5 text-zinc-400" />
              <span>Establishment Type</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESTAURANT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => handleInputChange("restaurantType", type.id)}
                  className={`p-3 border text-left transition-all flex flex-col justify-between ${
                    formData.restaurantType === type.id
                      ? "border-white bg-black text-white"
                      : "border-zinc-800 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="font-bold text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Target Diners &amp; Audience</span>
            </label>
            <Textarea
              value={formData.targetAudience}
              onChange={(e) => handleInputChange("targetAudience", e.target.value)}
              placeholder="e.g. Office workers, bankers, students, weekend diners seeking authentic local cuisine."
              rows={3}
              className="bg-black border-zinc-800 text-white font-mono text-xs resize-none"
            />
            <p className="text-[11px] text-zinc-500 font-sans">
              Shapes the tone of voice, urgency triggers, and cultural references in captions.
            </p>
          </div>

          {/* Primary Customer Action */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
              <Send className="w-3.5 h-3.5 text-zinc-400" />
              <span>Primary Customer Conversion Action</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRIMARY_ACTIONS.map((action) => (
                <button
                  type="button"
                  key={action.id}
                  onClick={() => handleInputChange("primaryCustomerAction", action.id)}
                  className={`p-3 border text-left transition-all ${
                    formData.primaryCustomerAction === action.id
                      ? "border-white bg-black text-white font-bold"
                      : "border-zinc-800 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-xs">{action.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Business Description */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-zinc-300 flex items-center gap-1.5 font-bold">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Business Description</span>
            </label>
            <Textarea
              value={formData.businessDescription || ""}
              onChange={(e) => handleInputChange("businessDescription", e.target.value)}
              placeholder="e.g. Artisanal scratch kitchen specializing in wood-fired pizzas, slow-simmered sauces, and housemade pasta."
              rows={3}
              className="bg-black border-zinc-800 text-white font-mono text-xs resize-none"
            />
            <p className="text-[11px] text-zinc-500 font-sans">
              Provides culinary nuance and unique craft details for your AI strategy items.
            </p>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 font-mono text-xs">
            <Button type="submit" variant="default" disabled={isSaving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Restaurant Profile"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

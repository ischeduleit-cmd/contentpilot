"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, Layers } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/app")) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="py-12 bg-black border-t border-zinc-800 text-zinc-400 font-mono text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block font-sans">
                ContentPilot
              </span>
              <span className="text-[11px] text-zinc-400">
                Autonomous Culinary Angles · High-Conversion Scheduling · Restaurant Social Automation
              </span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shadow-sm"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} ContentPilot. All rights reserved.</p>
          <p>Engineered for Independent Restaurants &amp; Culinary Operators</p>
        </div>
      </div>
    </footer>
  );
}

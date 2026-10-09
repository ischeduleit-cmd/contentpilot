"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Layers, Mail } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide public footer on authenticated app routes
  if (pathname.startsWith("/app")) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black border-t border-zinc-800 text-zinc-400 font-sans text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* Top 4-Column Grid (Buffer-Inspired Multi-Column Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Positioning */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-tight font-bold text-white group">
              <div className="w-7 h-7 bg-white text-black flex items-center justify-center transition-transform group-hover:scale-95">
                <Layers className="w-4 h-4" />
              </div>
              <span>CONTENTPILOT</span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed">
              AI content strategist for restaurants. Turn the photos and videos you already have into high-converting Instagram and TikTok marketing.
            </p>
            <div className="font-mono text-[11px] text-zinc-500 pt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>ischeduleit@gmail.com</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-wider text-white text-[11px]">
              Product
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#live-strategy" className="hover:text-white transition-colors">
                  Live Strategy Run
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Features */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-wider text-white text-[11px]">
              Platform
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Restaurant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/content" className="hover:text-white transition-colors">
                  Content Library
                </Link>
              </li>
              <li>
                <Link href="/app/strategy" className="hover:text-white transition-colors">
                  7-Day Strategy Engine
                </Link>
              </li>
              <li>
                <Link href="/app/restaurant" className="hover:text-white transition-colors">
                  Restaurant Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Access & Onboarding */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-wider text-white text-[11px]">
              Get Started
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Start Free ($0/mo)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">
                  Establishment Setup
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Sub-footer */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} ContentPilot. All rights reserved.</span>
            <span>Engineered for Independent Restaurants &amp; Culinary Brands</span>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}

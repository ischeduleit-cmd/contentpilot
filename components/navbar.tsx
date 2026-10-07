"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Calendar, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  // Hide public navbar on authenticated app routes
  if (pathname.startsWith("/app")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm tracking-tight font-bold text-white group"
          >
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center transition-transform group-hover:scale-95">
              <Layers className="w-4 h-4" />
            </div>
            <span>CONTENTPILOT</span>
          </Link>
        </div>

        {/* Public Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-3 font-mono text-xs">
          <Link
            href="/"
            className="px-2.5 py-1 text-zinc-400 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/#live-strategy"
            className="px-2.5 py-1 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Live Strategy Run</span>
          </Link>
          <Link
            href="/login"
            className="px-2.5 py-1 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
          <Link href="/onboarding">
            <Button variant="default" size="sm" className="font-mono text-xs gap-1.5 h-8 px-3">
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

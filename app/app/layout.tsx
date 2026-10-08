"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Store,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      name: "Home",
      href: "/app",
      icon: LayoutDashboard,
      isActive: pathname === "/app",
    },
    {
      name: "Content",
      href: "/app/content",
      icon: FolderOpen,
      isActive: pathname.startsWith("/app/content"),
    },
    {
      name: "Strategy",
      href: "/app/strategy",
      icon: Calendar,
      isActive: pathname.startsWith("/app/strategy"),
    },
    {
      name: "Restaurant",
      href: "/app/restaurant",
      icon: Store,
      isActive: pathname.startsWith("/app/restaurant"),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Main Authenticated Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand & Workspace Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 font-mono text-sm tracking-tight font-bold text-white group"
            >
              <div className="w-7 h-7 bg-white text-black flex items-center justify-center transition-transform group-hover:scale-95">
                <Layers className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">CONTENTPILOT</span>
            </Link>

            <span className="text-zinc-700 hidden sm:inline">/</span>

            {/* Active Restaurant Workspace */}
            <Link
              href="/app/restaurant"
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                Ovie&apos;s Kitchen
              </span>
              <span className="text-zinc-600 hidden md:inline">· Akure</span>
            </Link>
          </div>

          {/* Minimal 4-Item Navigation */}
          <nav className="flex items-center gap-1 font-mono text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                    item.isActive
                      ? "bg-white text-black font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out / Exit Entry */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <Link
              href="/login"
              title="Sign Out to Login"
              className="px-2.5 py-1 text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authenticated Body */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

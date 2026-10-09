"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Utensils, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  if (pathname === "/" || pathname.startsWith("/app")) return null;

  return (
    <header className="flow-nav">
      <Link className="flow-brand" href="/"><span><Utensils size={18} /></span>contentpilot</Link>
      <button className="flow-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? "is-open" : ""} aria-label="Main navigation">
        <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
        <Link href="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link href="/#faq" onClick={() => setOpen(false)}>FAQ</Link>
        <Link href={pathname === "/login" ? "/signup" : "/login"} onClick={() => setOpen(false)}>{pathname === "/login" ? "Create account" : "Log in"}</Link>
        {pathname !== "/signup" && !pathname.startsWith("/onboarding") && <Link className="flow-nav-cta" href="/signup" onClick={() => setOpen(false)}>Start free<ArrowRight size={15} /></Link>}
      </nav>
    </header>
  );
}

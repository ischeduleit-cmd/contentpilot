"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FolderOpen, Home, MapPin, Utensils } from "lucide-react";
import { getStoredRestaurantProfile } from "@/lib/onboarding-store";

const navLinks = [
  { name: "Home", href: "/app", icon: Home },
  { name: "Content", href: "/app/content", icon: FolderOpen },
  { name: "Strategy", href: "/app/strategy", icon: CalendarDays },
  { name: "Restaurant", href: "/app/restaurant", icon: Utensils },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [restaurantName, setRestaurantName] = React.useState("Your restaurant");
  const [location, setLocation] = React.useState("");

  React.useEffect(() => {
    const profile = getStoredRestaurantProfile();
    if (profile?.name) setRestaurantName(profile.name);
    if (profile?.location) setLocation(profile.location);
  }, [pathname]);

  const nav = (compact = false) => navLinks.map(({ name, href, icon: Icon }) => {
    const active = name === "Home" ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`app-nav-link ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`}><Icon aria-hidden="true" /><span>{name}</span></Link>;
  });

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" href="/app"><span className="app-brand-mark"><Utensils size={18} /></span><span>contentpilot</span></Link>
        <div className="app-workspace-label">YOUR WORKSPACE</div>
        <Link className="app-restaurant-switch" href="/app/restaurant"><span className="app-restaurant-avatar"><Utensils size={16} /></span><span><strong>{restaurantName}</strong><small>{location || "Restaurant profile"}</small></span><span className="app-switch-caret">⌄</span></Link>
        <nav className="app-nav" aria-label="Workspace navigation">{nav()}</nav>
        <div className="app-sidebar-note"><span><MapPin size={15} /></span><div><strong>Made for your restaurant</strong><small>Your plan is guided by your goals, audience and existing content.</small></div></div>
        <Link className="app-sidebar-help" href="/">← Back to ContentPilot</Link>
      </aside>

      <div className="app-workspace">
        <header className="app-mobile-header"><Link className="app-brand" href="/app"><span className="app-brand-mark"><Utensils size={17} /></span><span>contentpilot</span></Link><Link className="app-mobile-restaurant" href="/app/restaurant">{restaurantName}</Link></header>
        <main className="app-main-content">{children}</main>
      </div>

      <nav className="app-mobile-nav" aria-label="Workspace navigation">{nav(true)}</nav>
    </div>
  );
}

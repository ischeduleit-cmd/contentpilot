"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, FolderOpen, Home, LogOut, Utensils } from "lucide-react";
import { getStoredRestaurantProfile, saveStoredRestaurantProfile } from "@/lib/onboarding-store";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const navLinks = [
  { name: "Home", href: "/app", icon: Home },
  { name: "Content", href: "/app/content", icon: FolderOpen },
  { name: "Strategy", href: "/app/strategy", icon: CalendarDays },
  { name: "Restaurant", href: "/app/restaurant", icon: Utensils },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountReady, setAccountReady] = React.useState(false);
  const [restaurantName, setRestaurantName] = React.useState("Your restaurant");
  const [sheetsSyncStatus, setSheetsSyncStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.replace("/login?error=auth-unconfigured");
      return;
    }
    let active = true;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.access_token) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      let response = await fetch("/api/onboarding", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!active) return;
      if (response.status === 404) {
        const missingProfile = await response.json();
        if (missingProfile.pendingRegistration) {
          response = await fetch("/api/onboarding", {
            method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ weekStart: new Date().toISOString().slice(0, 10) }),
          });
          if (!response.ok) { router.replace("/onboarding"); return; }
        } else {
          router.replace("/onboarding");
          return;
        }
      }
      if (!response.ok) {
        router.replace("/login?error=session-check-failed");
        return;
      }
      const result = await response.json();
      if (result.restaurant) {
        saveStoredRestaurantProfile(result.restaurant);
        setRestaurantName(result.restaurant.name);
      } else {
        const profile = getStoredRestaurantProfile();
        if (profile?.name) setRestaurantName(profile.name);
      }
      if (result.sheetsSync?.status) setSheetsSyncStatus(result.sheetsSync.status);
      setAccountReady(true);
    };
    checkSession().catch(() => router.replace("/login?error=session-check-failed"));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [pathname, router]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/login");
  };

  const retrySheetsSync = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
    if (!session?.access_token) return;
    const response = await fetch("/api/onboarding", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) return;
    const result = await response.json();
    if (result.sheetsSync?.status) setSheetsSyncStatus(result.sheetsSync.status);
  };

  const nav = (compact = false) => navLinks.map(({ name, href, icon: Icon }) => {
    const active = name === "Home" ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`app-nav-link ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`}><Icon aria-hidden="true" /><span>{name}</span></Link>;
  });

  if (!accountReady) {
    return (
      <div className="cp-access-check" role="status" aria-live="polite">
        <span className="cp-access-check-mark"><Utensils size={18} aria-hidden="true" /></span>
        <span>Checking your account…</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" href="/app"><span className="app-brand-mark"><Utensils size={18} /></span><span>contentpilot</span></Link>
        <div className="app-workspace-label">WORKSPACE</div>
        <Link className="app-restaurant-switch" href="/app/restaurant"><span><strong>{restaurantName}</strong></span></Link>
        <nav className="app-nav" aria-label="Workspace navigation">{nav()}</nav>
        <button type="button" className="app-sidebar-help" onClick={handleLogout}><LogOut size={15} aria-hidden="true" /><span>Log out</span></button>
      </aside>

      <div className="app-workspace">
        {sheetsSyncStatus && sheetsSyncStatus !== "synced" && sheetsSyncStatus !== "already_synced" && <div className="mx-4 mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:mx-6"><div className="flex flex-wrap items-center justify-between gap-3"><span>{sheetsSyncStatus === "pending_configuration" ? "Your workspace is saved, but Google Sheets sync is not configured on the server." : "Your workspace is saved, but Google Sheets sync failed. Your registration is still safe in ContentPilot."}</span><button type="button" onClick={() => void retrySheetsSync()} className="font-semibold underline">Retry sync</button></div></div>}
        <header className="app-mobile-header"><Link className="app-brand" href="/app"><span className="app-brand-mark"><Utensils size={17} /></span><span>contentpilot</span></Link><span className="app-mobile-restaurant">{restaurantName}</span><button className="app-mobile-logout" type="button" aria-label="Log out" onClick={handleLogout}><LogOut size={17} /></button></header>
        <main className="app-main-content">{children}</main>
      </div>

      <nav className="app-mobile-nav" aria-label="Workspace navigation">{nav(true)}</nav>
    </div>
  );
}

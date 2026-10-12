import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ipv4HttpsFetch } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const RESTAURANT_TYPES = new Set(["restaurant", "fast_food", "cafe", "bakery", "food_delivery", "bar_lounge", "other"]);
const CUSTOMER_ACTIONS = new Set(["order_food", "visit", "whatsapp", "book_table", "discover", "other"]);
const BUSINESS_GOALS = new Set(["get_more_orders", "promote_menu", "increase_awareness", "build_trust", "increase_engagement", "promote_event", "bring_customers_in", "increase_lunch_orders", "other"]);
const GENERIC_SIGNUP_ERROR = "We could not start registration. Check your details or sign in if you already have an account.";

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Check the registration details and try again." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Check the registration details and try again." }, { status: 400 });
  }

  const restaurantName = text(body.restaurantName, 255);
  const location = text(body.location, 255);
  const restaurantType = text(body.restaurantType, 60);
  const targetAudience = text(body.targetAudience, 1000);
  const primaryCustomerAction = text(body.primaryCustomerAction, 60);
  const businessDescription = text(body.businessDescription, 5000);
  const goal = text(body.goal, 80);
  const goalDescription = text(body.goalDescription, 2000);
  const email = text(body.email, 255).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!restaurantName || !location || !targetAudience || !businessDescription || !email ||
      !RESTAURANT_TYPES.has(restaurantType) || !CUSTOMER_ACTIONS.has(primaryCustomerAction) || !BUSINESS_GOALS.has(goal) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 || password !== confirmPassword) {
    return NextResponse.json({ error: "Check the required details, email, and password confirmation." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: "Registration is temporarily unavailable." }, { status: 503 });

  // This isolated client never reads or writes the browser's existing auth session.
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: ipv4HttpsFetch as any },
  });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { registration: { restaurantName, location, restaurantType, targetAudience, primaryCustomerAction, businessDescription, goal, goalDescription } } },
  });

  if (error) {
    // Keep duplicate-address responses indistinguishable from other signup failures.
    console.warn("[Auth Signup] Supabase rejected a signup request.", { status: error.status || "unknown" });
    return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
  }

  // Email confirmation must remain enabled in Supabase. Never treat a session
  // returned directly by signup as evidence that the code was entered.
  if (data.session || !data.user || data.user.email_confirmed_at) {
    console.error("[Auth Signup] Signup returned an authenticated or confirmed user; email confirmation configuration needs review.");
    return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
  }

  return NextResponse.json({ success: true, email }, { status: 200 });
}

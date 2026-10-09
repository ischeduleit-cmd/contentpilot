/**
 * Client-side persistence and state management for Onboarding & Restaurant Profiles
 * Scoped strictly to authenticated restaurant workspaces.
 */

import {
  Restaurant,
  WeeklyGoal,
  RestaurantType,
  PrimaryCustomerAction,
  BusinessGoalType,
  User,
} from "./db/schema";

const RESTAURANT_STORAGE_KEY = "contentpilot_restaurant_profile";
const GOAL_STORAGE_KEY = "contentpilot_weekly_goal";
const USER_STORAGE_KEY = "contentpilot_user_session";

export interface OnboardingRestaurantForm {
  id?: string;
  userId?: string;
  name: string;
  location: string;
  restaurantType: RestaurantType;
  targetAudience: string;
  primaryCustomerAction: PrimaryCustomerAction;
  businessDescription?: string;
}

export interface OnboardingGoalForm {
  goal: BusinessGoalType;
  goalDescription: string;
  weekStart: string;
}

export interface UserSession {
  id: string;
  email: string;
}

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to store user session", e);
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear user session", e);
  }
}

export function getStoredRestaurantProfile(): OnboardingRestaurantForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESTAURANT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredRestaurantProfile(profile: OnboardingRestaurantForm): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to store restaurant profile", e);
  }
}

export function getStoredGoalProfile(): OnboardingGoalForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredGoalProfile(goal: OnboardingGoalForm): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
  } catch (e) {
    console.error("Failed to store goal profile", e);
  }
}

export function clearStoredOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    localStorage.removeItem(GOAL_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear onboarding store", e);
  }
}

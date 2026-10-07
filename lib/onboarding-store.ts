/**
 * Client-side persistence and state management for Onboarding & Restaurant Profiles
 */

import {
  Restaurant,
  WeeklyGoal,
  RestaurantType,
  PrimaryCustomerAction,
  BusinessGoalType,
} from "./db/schema";
import { BENCHMARK_RESTAURANT } from "./constants";

const RESTAURANT_STORAGE_KEY = "contentpilot_restaurant_profile";
const GOAL_STORAGE_KEY = "contentpilot_weekly_goal";

export interface OnboardingRestaurantForm {
  name: string;
  location: string;
  restaurantType: RestaurantType;
  targetAudience: string;
  primaryCustomerAction: PrimaryCustomerAction;
}

export interface OnboardingGoalForm {
  goal: BusinessGoalType;
  goalDescription: string;
  weekStart: string;
}

export const DEFAULT_RESTAURANT_PROFILE: OnboardingRestaurantForm = {
  name: BENCHMARK_RESTAURANT.name,
  location: BENCHMARK_RESTAURANT.location,
  restaurantType: BENCHMARK_RESTAURANT.type,
  targetAudience: BENCHMARK_RESTAURANT.targetAudience,
  primaryCustomerAction: BENCHMARK_RESTAURANT.primaryAction,
};

export const DEFAULT_GOAL_PROFILE: OnboardingGoalForm = {
  goal: BENCHMARK_RESTAURANT.activeGoal.goal,
  goalDescription: BENCHMARK_RESTAURANT.activeGoal.description,
  weekStart: "2026-10-12",
};

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
  } catch (e) {
    console.error("Failed to clear onboarding store", e);
  }
}

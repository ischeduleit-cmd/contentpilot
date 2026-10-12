-- Draft additive migration. Review the live Supabase schema before applying:
-- PRD documents text IDs while Drizzle currently declares UUID IDs.
-- No payment flow should be enabled until this migration and RLS are reviewed.

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS business_description text,
  ADD COLUMN IF NOT EXISTS sheets_sync_status text NOT NULL DEFAULT 'pending_configuration',
  ADD COLUMN IF NOT EXISTS sheets_synced_at timestamptz;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('free', 'grow', 'pro')),
  status text NOT NULL CHECK (status IN ('active', 'pending', 'past_due', 'expired', 'refunded', 'cancelled')),
  provider text,
  mode text NOT NULL DEFAULT 'test' CHECK (mode IN ('test', 'live')),
  provider_customer_id text,
  provider_reference text UNIQUE,
  currency text,
  amount_minor bigint,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  mode text NOT NULL DEFAULT 'test' CHECK (mode IN ('test', 'live')),
  provider_event_id text NOT NULL,
  provider_reference text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('grow', 'pro')),
  amount_minor bigint NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'awaiting_transfer', 'processing', 'paid', 'failed', 'expired', 'refunded')),
  expires_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read their account row" ON public.users;
CREATE POLICY "Authenticated users can read their account row" ON public.users
  FOR SELECT TO authenticated USING (lower(email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Owners manage their restaurants" ON public.restaurants;
CREATE POLICY "Owners manage their restaurants" ON public.restaurants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id::text = restaurants.user_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id::text = restaurants.user_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Owners manage restaurant goals" ON public.weekly_goals;
CREATE POLICY "Owners manage restaurant goals" ON public.weekly_goals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = weekly_goals.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = weekly_goals.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Owners manage restaurant assets" ON public.content_assets;
CREATE POLICY "Owners manage restaurant assets" ON public.content_assets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = content_assets.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = content_assets.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Owners manage restaurant plans" ON public.content_plans;
CREATE POLICY "Owners manage restaurant plans" ON public.content_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = content_plans.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r JOIN public.users u ON u.id::text = r.user_id::text WHERE r.id::text = content_plans.restaurant_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Owners manage plan items" ON public.content_plan_items;
CREATE POLICY "Owners manage plan items" ON public.content_plan_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.content_plans p JOIN public.restaurants r ON r.id::text = p.restaurant_id::text JOIN public.users u ON u.id::text = r.user_id::text WHERE p.id::text = content_plan_items.plan_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.content_plans p JOIN public.restaurants r ON r.id::text = p.restaurant_id::text JOIN public.users u ON u.id::text = r.user_id::text WHERE p.id::text = content_plan_items.plan_id::text AND lower(u.email) = lower(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own payment events" ON public.payment_events;
CREATE POLICY "Users can view their own payment events"
  ON public.payment_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON public.subscriptions (user_id, status, current_period_end DESC);
CREATE INDEX IF NOT EXISTS payment_events_user_created_idx ON public.payment_events (user_id, created_at DESC);

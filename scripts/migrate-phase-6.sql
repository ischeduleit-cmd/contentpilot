CREATE TABLE IF NOT EXISTS content_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  weekly_goal_id TEXT,
  week_start DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS content_plan_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_id TEXT REFERENCES content_plans(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  scheduled_date DATE NOT NULL,
  asset_id TEXT REFERENCES content_assets(id) ON DELETE SET NULL,
  content_pillar VARCHAR(100) NOT NULL,
  objective VARCHAR(100) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'both',
  hook TEXT NOT NULL,
  caption TEXT NOT NULL,
  cta TEXT NOT NULL,
  recommended_time VARCHAR(50),
  strategic_rationale TEXT,
  content_to_create TEXT,
  instagram_adaptation JSONB,
  tiktok_adaptation JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on content_plans" ON content_plans;
CREATE POLICY "Allow all on content_plans" ON content_plans FOR ALL USING (true);

ALTER TABLE content_plan_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on content_plan_items" ON content_plan_items;
CREATE POLICY "Allow all on content_plan_items" ON content_plan_items FOR ALL USING (true);

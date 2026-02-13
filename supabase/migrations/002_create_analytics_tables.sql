-- Analytics and Performance Tracking Tables

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  duration_seconds INTEGER
);

-- Error Tracking Table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  page_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  severity TEXT DEFAULT 'error',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_page ON performance_metrics(page_path);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session ON user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can insert analytics events"
ON analytics_events FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can insert page views"
ON page_views FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can insert performance metrics"
ON performance_metrics FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert sessions"
ON user_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update own sessions"
ON user_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can insert error logs"
ON error_logs FOR INSERT
TO public
WITH CHECK (true);

-- Function to track page view
CREATE OR REPLACE FUNCTION track_page_view(
  page_path TEXT,
  session_id TEXT,
  referrer TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO page_views (page_path, session_id, referrer, user_agent)
  VALUES (page_path, session_id, referrer, user_agent);

  -- Update or create session
  INSERT INTO user_sessions (session_id, started_at)
  VALUES (session_id, NOW())
  ON CONFLICT (session_id)
  DO UPDATE SET
    page_views = user_sessions.page_views + 1;
END;
$$;

-- Function to track performance metric
CREATE OR REPLACE FUNCTION track_performance_metric(
  page_path TEXT,
  metric_name TEXT,
  metric_value NUMERIC,
  session_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO performance_metrics (page_path, metric_name, metric_value, session_id)
  VALUES (page_path, metric_name, metric_value, session_id);
END;
$$;
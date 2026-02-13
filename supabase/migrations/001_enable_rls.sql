-- Enable Row Level Security on all CMS tables
-- This ensures users can only access authorized data

-- Enable RLS on cms_pages
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cms_content
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cms_settings
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cms_navigation
ALTER TABLE cms_navigation ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cms_images
ALTER TABLE cms_images ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cms_sync_log
ALTER TABLE cms_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy for cms_pages
-- Public read access for published pages, authenticated write for admins
CREATE POLICY "Public read access for published pages"
ON cms_pages FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Authenticated users can manage all pages"
ON cms_pages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy for cms_content
-- Public read access for visible content
CREATE POLICY "Public read access for visible content"
ON cms_content FOR SELECT
TO public
USING (is_visible = true);

CREATE POLICY "Authenticated users can manage all content"
ON cms_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy for cms_settings
-- Public read access for non-sensitive settings
CREATE POLICY "Public read access for public settings"
ON cms_settings FOR SELECT
TO public
USING (
  key NOT IN (
    'admin_email',
    'smtp_password',
    'api_secret_key',
    'payment_secret'
  )
);

CREATE POLICY "Authenticated users can manage settings"
ON cms_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy for cms_navigation
-- Public read access for active navigation
CREATE POLICY "Public read access for active navigation"
ON cms_navigation FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can manage navigation"
ON cms_navigation FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy for cms_images
-- Public read access for all images
CREATE POLICY "Public read access for all images"
ON cms_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage images"
ON cms_images FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy for cms_sync_log
-- Only authenticated users can read logs
CREATE POLICY "Authenticated users can read sync logs"
ON cms_sync_log FOR SELECT
TO authenticated
USING (true);

-- Only service role can insert sync logs
CREATE POLICY "Service role can insert sync logs"
ON cms_sync_log FOR INSERT
TO service_role
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cms_content_updated_at
  BEFORE UPDATE ON cms_content
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cms_settings_updated_at
  BEFORE UPDATE ON cms_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
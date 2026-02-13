-- Media Files Table for advanced media management
CREATE TABLE IF NOT EXISTS media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  duration DECIMAL,
  alt_text TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created ON media_files(created_at);

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can insert media files"
ON media_files FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can read media files"
ON media_files FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can update media files"
ON media_files FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete media files"
ON media_files FOR DELETE
TO authenticated
USING (true);
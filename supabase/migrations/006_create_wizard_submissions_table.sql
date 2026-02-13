-- Create wizard_submissions table for property management wizard
CREATE TABLE IF NOT EXISTS wizard_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('not_listed', 'already_listed', 'switching')),
  listing_url TEXT,
  current_manager TEXT,
  locality TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms TEXT NOT NULL,
  sleeps TEXT NOT NULL,
  timeline TEXT NOT NULL,
  goal TEXT NOT NULL,
  hands_off BOOLEAN NOT NULL DEFAULT false,
  licence_ready BOOLEAN NOT NULL DEFAULT false,
  upgrade_budget TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('whatsapp', 'phone', 'email')),
  consent BOOLEAN NOT NULL DEFAULT false,
  tier TEXT NOT NULL,
  plan TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wizard_submissions_email ON wizard_submissions(email);
CREATE INDEX IF NOT EXISTS idx_wizard_submissions_locality ON wizard_submissions(locality);
CREATE INDEX IF NOT EXISTS idx_wizard_submissions_status ON wizard_submissions(status);
CREATE INDEX IF NOT EXISTS idx_wizard_submissions_submitted_at ON wizard_submissions(submitted_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE wizard_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anonymous users to insert submissions (for the wizard form)
CREATE POLICY "Allow anonymous insert" ON wizard_submissions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read all submissions (admin access)
CREATE POLICY "Allow authenticated read" ON wizard_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Restrict updates and deletes to maintain data integrity
CREATE POLICY "Restrict updates" ON wizard_submissions
  FOR UPDATE USING (false);

CREATE POLICY "Restrict deletes" ON wizard_submissions
  FOR DELETE USING (false);

-- Add comments for documentation
COMMENT ON TABLE wizard_submissions IS 'Property management wizard form submissions';
COMMENT ON COLUMN wizard_submissions.status IS 'Current listing status of the property';
COMMENT ON COLUMN wizard_submissions.listing_url IS 'URL of existing listing if applicable';
COMMENT ON COLUMN wizard_submissions.current_manager IS 'Current property manager if switching';
COMMENT ON COLUMN wizard_submissions.locality IS 'Property location in Malta';
COMMENT ON COLUMN wizard_submissions.property_type IS 'Type of property (apartment, villa, etc.)';
COMMENT ON COLUMN wizard_submissions.bedrooms IS 'Number of bedrooms';
COMMENT ON COLUMN wizard_submissions.sleeps IS 'Maximum number of guests';
COMMENT ON COLUMN wizard_submissions.timeline IS 'Desired timeline for listing';
COMMENT ON COLUMN wizard_submissions.goal IS 'Primary goal for property management';
COMMENT ON COLUMN wizard_submissions.hands_off IS 'Whether client wants complete hands-off service';
COMMENT ON COLUMN wizard_submissions.licence_ready IS 'Whether client has or can obtain licence';
COMMENT ON COLUMN wizard_submissions.upgrade_budget IS 'Budget available for property upgrades';
COMMENT ON COLUMN wizard_submissions.tier IS 'Computed service tier (A, B, or C)';
COMMENT ON COLUMN wizard_submissions.plan IS 'Computed service plan (Essentials or Complete)';
COMMENT ON COLUMN wizard_submissions.ip_address IS 'IP address of submitter for analytics';
COMMENT ON COLUMN wizard_submissions.user_agent IS 'User agent string of submitter';

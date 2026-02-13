-- Create database functions for wizard submissions

-- Function to insert wizard submission
CREATE OR REPLACE FUNCTION insert_wizard_submission(submission_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    submission_id uuid;
BEGIN
    INSERT INTO wizard_submissions (
        status,
        listing_url,
        current_manager,
        locality,
        property_type,
        bedrooms,
        sleeps,
        timeline,
        goal,
        hands_off,
        licence_ready,
        upgrade_budget,
        name,
        email,
        phone,
        preferred_contact,
        consent,
        tier,
        plan,
        ip_address,
        user_agent,
        submitted_at
    ) VALUES (
        submission_data->>'status',
        submission_data->>'listingUrl',
        submission_data->>'currentManager',
        submission_data->>'locality',
        submission_data->>'propertyType',
        submission_data->>'bedrooms',
        submission_data->>'sleeps',
        submission_data->>'timeline',
        submission_data->>'goal',
        submission_data->>'handsOff',
        submission_data->>'licenceReady',
        submission_data->>'upgradeBudget',
        submission_data->>'name',
        submission_data->>'email',
        submission_data->>'phone',
        submission_data->>'preferredContact',
        submission_data->>'consent',
        submission_data->>'tier',
        submission_data->>'plan',
        submission_data->>'ip_address',
        submission_data->>'user_agent',
        COALESCE(submission_data->>'submitted_at', NOW())
    )
    RETURNING id INTO submission_id;
    
    RETURN submission_id;
END;
$$;

-- Function to get wizard submissions
CREATE OR REPLACE FUNCTION get_wizard_submissions(limit_count integer DEFAULT 100)
RETURNS TABLE (
    id uuid,
    status text,
    listing_url text,
    current_manager text,
    locality text,
    property_type text,
    bedrooms text,
    sleeps text,
    timeline text,
    goal text,
    hands_off boolean,
    licence_ready boolean,
    upgrade_budget text,
    name text,
    email text,
    phone text,
    preferred_contact text,
    consent boolean,
    tier text,
    plan text,
    ip_address text,
    user_agent text,
    submitted_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.*
    FROM wizard_submissions ws
    ORDER BY ws.submitted_at DESC
    LIMIT limit_count;
END;
$$;

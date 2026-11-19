-- Create the rethink_audits table inside the dedicated business_audit schema
CREATE TABLE IF NOT EXISTS business_audit.rethink_audits (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(150) UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(150),
    category VARCHAR(100) NOT NULL,
    locality VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    maps_url TEXT,
    auditor_name VARCHAR(150) DEFAULT 'Rethink Field Auditor' NOT NULL,
    total_score INTEGER NOT NULL,
    max_score INTEGER DEFAULT 100 NOT NULL,
    percentage INTEGER DEFAULT 0 NOT NULL,
    band_title VARCHAR(100) NOT NULL,
    band_range VARCHAR(50) NOT NULL,
    band_headline TEXT NOT NULL,
    band_description TEXT NOT NULL,
    sprint_recommendation VARCHAR(200) NOT NULL,
    sprint_details TEXT NOT NULL,
    maps_score INTEGER DEFAULT 0 NOT NULL,
    visuals_score INTEGER DEFAULT 0 NOT NULL,
    web_score INTEGER DEFAULT 0 NOT NULL,
    ads_score INTEGER DEFAULT 0 NOT NULL,
    speed_score INTEGER DEFAULT 0 NOT NULL,
    section_scores JSONB NOT NULL,
    answers JSONB NOT NULL,
    findings JSONB NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    last_viewed_at TIMESTAMPTZ,
    shared_via_whatsapp_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rethink_audits_name ON business_audit.rethink_audits (business_name);
CREATE INDEX IF NOT EXISTS idx_rethink_audits_whatsapp ON business_audit.rethink_audits (whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_rethink_audits_category ON business_audit.rethink_audits (category);
CREATE INDEX IF NOT EXISTS idx_rethink_audits_total_score ON business_audit.rethink_audits (total_score);
CREATE INDEX IF NOT EXISTS idx_rethink_audits_created_at ON business_audit.rethink_audits (created_at DESC);

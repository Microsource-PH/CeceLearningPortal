-- Create instructor_approvals table
CREATE TABLE IF NOT EXISTS instructor_approvals (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    bio TEXT,
    qualifications TEXT,
    teaching_experience TEXT,
    linked_in_profile TEXT,
    website_url TEXT,
    status INTEGER NOT NULL DEFAULT 0,
    reviewer_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "AspNetUsers"("Id")
);
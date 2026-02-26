-- Create skyenergy_feedback table
CREATE TABLE IF NOT EXISTS skyenergy_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Inovação', 'Empatia', 'Confiança', 'Eficiência')),
  reason TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  month_year TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'),
  created_by_session_id TEXT
);

-- Create hr_users table for RH authentication
CREATE TABLE IF NOT EXISTS hr_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create sessions table for HR
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hr_user_id UUID NOT NULL REFERENCES hr_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_status ON skyenergy_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON skyenergy_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_month_year ON skyenergy_feedback(month_year);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON skyenergy_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create funcionarios table
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  setor TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add setor column if table already exists
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS setor TEXT;

-- Insert some example employees (you can modify or add more via Supabase dashboard)
INSERT INTO funcionarios (nome, setor) VALUES
  ('Zilmar', 'TI'),
  ('João Silva', 'RH'),
  ('Maria Santos', 'Financeiro'),
  ('Pedro Oliveira', 'Operações'),
  ('Ana Costa', 'Marketing')
ON CONFLICT (nome) DO NOTHING;

-- Enable RLS
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read
CREATE POLICY "Allow public read access" ON funcionarios
  FOR SELECT
  USING (true);

-- Create policy to allow insert
CREATE POLICY "Allow insert" ON funcionarios
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow update
CREATE POLICY "Allow update" ON funcionarios
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

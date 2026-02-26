-- Create bugs table for tracking bug reports
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  pagina TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'rejeitado')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_created_at ON bugs(created_at DESC);

-- Enable RLS
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bugs
CREATE POLICY "Anyone can report bugs" ON bugs
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to read bugs
CREATE POLICY "Anyone can view bugs" ON bugs
  FOR SELECT
  USING (true);

-- Create policy to allow updates (for admin/RH)
CREATE POLICY "Anyone can update bugs" ON bugs
  FOR UPDATE
  USING (true);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bugs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bugs_updated_at
  BEFORE UPDATE ON bugs
  FOR EACH ROW
  EXECUTE FUNCTION update_bugs_updated_at();

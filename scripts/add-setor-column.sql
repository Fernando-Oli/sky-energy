-- Add setor column to funcionarios table
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS setor TEXT;

-- Update some example employees with setores (optional)
UPDATE funcionarios SET setor = 'TI' WHERE nome = 'Zilmar';
UPDATE funcionarios SET setor = 'RH' WHERE nome = 'João Silva';
UPDATE funcionarios SET setor = 'Financeiro' WHERE nome = 'Maria Santos';
UPDATE funcionarios SET setor = 'Operações' WHERE nome = 'Pedro Oliveira';
UPDATE funcionarios SET setor = 'Marketing' WHERE nome = 'Ana Costa';

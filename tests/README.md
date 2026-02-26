# Guia de Testes - SkyEnergy

Documentação sobre a estratégia e execução de testes da aplicação.

## Estrutura de Testes

\`\`\`
tests/
├── unit/                           # Testes unitários
│   ├── photo-upload.test.ts       # Testes de compressão de imagem
│   └── employee-validation.test.ts # Testes de validação
├── integration/                    # Testes de integração
│   └── feedback-flow.test.ts      # Testes de fluxo completo
└── README.md                       # Este arquivo
\`\`\`

## Tipos de Testes

### Testes Unitários

Testam funções e lógica isoladamente.

**Localização**: `/tests/unit/`

**Exemplos:**
- Compressão de imagens
- Validação de formulários
- Filtragem de dados
- Cálculos e transformações

### Testes de Integração

Testam fluxos completos da aplicação.

**Localização**: `/tests/integration/`

**Exemplos:**
- Fluxo de envio de feedback
- Aprovação de feedbacks
- CRUD de funcionários
- Integração com APIs

## Executando Testes

### Configuração

Para executar os testes, você precisará configurar um test runner como Jest ou Vitest.

#### Opção 1: Jest

\`\`\`bash
bun add -d jest @types/jest ts-jest
\`\`\`

Crie `jest.config.js`:

\`\`\`javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}
\`\`\`

#### Opção 2: Vitest (Recomendado)

\`\`\`bash
bun add -d vitest @vitest/ui
\`\`\`

Crie `vitest.config.ts`:

\`\`\`typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
\`\`\`

### Comandos

Adicione ao `package.json`:

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

Execute:

\`\`\`bash
# Modo watch
bun test

# Executar uma vez
bun test:run

# Com UI
bun test:ui

# Com coverage
bun test:coverage
\`\`\`

## Testes Implementados

### Unit Tests

#### photo-upload.test.ts

Testa funcionalidades de upload e compressão de fotos:

- ✅ Compressão de imagem para WebP
- ✅ Manutenção de aspect ratio
- ✅ Validação de tamanho (5MB max)
- ✅ Validação de tipos aceitos
- ✅ Rejeição de tipos inválidos
- ✅ Suporte a webcam

#### employee-validation.test.ts

Testa validações de funcionários:

- ✅ Filtro de funcionários ativos
- ✅ Busca case-insensitive
- ✅ Limite de 3 sugestões no autocomplete
- ✅ Validação de nome não vazio
- ✅ Busca por nome exato
- ✅ Validação de campos obrigatórios
- ✅ Toggle de status ativo/inativo

### Integration Tests

#### feedback-flow.test.ts

Testa fluxo completo de feedback:

**Validação de Formulário:**
- ✅ Campos obrigatórios preenchidos
- ✅ Rejeição sem categorias
- ✅ Rejeição ao enviar para si mesmo

**Validação de Funcionários:**
- ✅ Verifica se funcionários existem
- ✅ Verifica se funcionários estão ativos
- ✅ Rejeita funcionários inativos

**Processamento de Fotos:**
- ✅ Compressão antes de envio
- ✅ Taxa de compressão adequada

**Tratamento de Respostas:**
- ✅ Sucesso (200)
- ✅ Erro funcionário não encontrado (400)
- ✅ Erro de rede

**Dashboard RH:**
- ✅ Aprovação de feedback
- ✅ Rejeição de feedback
- ✅ Filtro por status

## Cobertura de Testes

### Áreas Cobertas

✅ **Compressão de Imagens**
- Conversão WebP
- Redimensionamento
- Validação de tamanho
- Validação de tipo

✅ **Validação de Funcionários**
- Busca e filtro
- Status ativo/inativo
- Campos obrigatórios
- Autocomplete

✅ **Fluxo de Feedback**
- Validação de formulário
- Envio e processamento
- Tratamento de erros

✅ **Dashboard RH**
- Aprovação/Rejeição
- Filtros de status

### Áreas para Expandir

⏳ **Testes E2E**
- Navegação completa
- Interações de usuário
- Screenshots

⏳ **Testes de API**
- Endpoints individuais
- Autenticação
- Rate limiting

⏳ **Testes de Performance**
- Tempo de compressão
- Carregamento de listas
- Upload de imagens

⏳ **Testes de Acessibilidade**
- Navegação por teclado
- Screen readers
- Contraste de cores

## Escrevendo Novos Testes

### Template de Teste Unitário

\`\`\`typescript
/**
 * Unit Tests - [Feature Name]
 * [Description]
 */

describe('[Feature]', () => {
  test('should [expected behavior]', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
\`\`\`

### Template de Teste de Integração

\`\`\`typescript
/**
 * Integration Tests - [Flow Name]
 * [Description]
 */

describe('[Flow]', () => {
  describe('[Sub-feature]', () => {
    test('should [complete action]', async () => {
      // Setup
      const mockData = { ... }
      
      // Execute
      const result = await fullFlowFunction(mockData)
      
      // Verify
      expect(result.success).toBe(true)
    })
  })
})
\`\`\`

## Mocking

### Dados de Teste

\`\`\`typescript
// Mock Employees
const mockEmployees = [
  { id: '1', nome: 'João Silva', setor: 'TI', ativo: true },
  { id: '2', nome: 'Maria Santos', setor: 'RH', ativo: true }
]

// Mock Feedback
const mockFeedback = {
  id: 'fb-123',
  from_name: 'João Silva',
  to_name: 'Maria Santos',
  categories: ['Colaboração'],
  reason: 'Ótimo trabalho',
  status: 'pending'
}
\`\`\`

### APIs Mock

\`\`\`typescript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
)

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}))
\`\`\`

## CI/CD

### GitHub Actions (Exemplo)

\`\`\`yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test:run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
\`\`\`

## Boas Práticas

### DO ✅

- Escreva testes antes de implementar (TDD)
- Teste casos de sucesso E erro
- Use nomes descritivos
- Mantenha testes independentes
- Mock dependências externas
- Teste edge cases

### DON'T ❌

- Não teste implementação, teste comportamento
- Não faça testes dependentes de ordem
- Não ignore testes falhando
- Não teste código de terceiros
- Não use dados de produção

## Debugging

### Logs

\`\`\`typescript
test('should debug test', () => {
  const result = complexFunction()
  console.log('Result:', result) // Debug output
  expect(result).toBeDefined()
})
\`\`\`

### Breakpoints

Use `debugger` ou `--inspect`:

\`\`\`bash
node --inspect node_modules/.bin/vitest
\`\`\`

### Isolated Run

\`\`\`bash
# Rodar teste específico
bun test photo-upload

# Rodar apenas um test
bun test -t "should compress image"
\`\`\`

## Recursos

- [Vitest Docs](https://vitest.dev)
- [Jest Docs](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contribuindo

Ao adicionar funcionalidades:

1. Escreva testes primeiro (TDD)
2. Garanta cobertura mínima de 80%
3. Teste casos de erro
4. Documente edge cases
5. Execute todos os testes antes de commit

---

**Última atualização**: 2024
**Versão**: 1.0.0

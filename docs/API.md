# API Documentation - SkyEnergy

Sistema de reconhecimento de equipes com feedbacks e premiação mensal do Grupo Skyline.

## Índice

- [Autenticação](#autenticação)
- [Endpoints de Funcionários](#endpoints-de-funcionários)
- [Endpoints de Feedbacks](#endpoints-de-feedbacks)
- [Endpoints do Dashboard](#endpoints-do-dashboard)
- [Modelos de Dados](#modelos-de-dados)
- [Códigos de Erro](#códigos-de-erro)

---

## Autenticação

A aplicação utiliza Supabase para gerenciamento de dados. Todas as requisições são autenticadas via service role key no lado do servidor.

---

## Endpoints de Funcionários

### GET /api/employees

Retorna lista de funcionários ativos.

**Resposta:**
```json
{
  "employees": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "setor": "TI"
    }
  ]
}
```

---

### GET /api/employees/manage

Retorna todos os funcionários (incluindo inativos) para o painel de RH.

**Resposta:**
```json
{
  "employees": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "setor": "TI",
      "ativo": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/employees/manage

Cria um novo funcionário.

**Body:**
```json
{
  "nome": "João Silva",
  "setor": "TI"
}
```

**Resposta:**
```json
{
  "employee": {
    "id": "uuid",
    "nome": "João Silva",
    "setor": "TI",
    "ativo": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Erros:**
- `400` - Nome é obrigatório
- `500` - Erro ao criar funcionário

---

### PUT /api/employees/manage

Atualiza dados de um funcionário.

**Body:**
```json
{
  "id": "uuid",
  "nome": "João Silva Atualizado",
  "setor": "TI",
  "ativo": true
}
```

**Resposta:**
```json
{
  "employee": {
    "id": "uuid",
    "nome": "João Silva Atualizado",
    "setor": "TI",
    "ativo": true
  },
  "success": true
}
```

**Erros:**
- `400` - ID é obrigatório
- `404` - Funcionário não encontrado
- `500` - Erro ao atualizar funcionário

---

### DELETE /api/employees/manage

Desativa um funcionário (soft delete).

**Body:**
```json
{
  "id": "uuid"
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## Endpoints de Feedbacks

### POST /api/feedback

Envia um novo feedback.

**Content-Type:** `multipart/form-data`

**Body:**
- `fromName` (string, required) - Nome de quem envia
- `toName` (string, required) - Nome de quem recebe
- `categories` (JSON string, required) - Array de categorias
- `reason` (string, optional) - Motivo do feedback
- `photo` (File, required) - Foto do feedback (max 5MB)
- `sessionId` (string, required) - ID da sessão

**Exemplo:**
```javascript
const formData = new FormData()
formData.append('fromName', 'João Silva')
formData.append('toName', 'Maria Santos')
formData.append('categories', JSON.stringify(['Colaboração', 'Proatividade']))
formData.append('reason', 'Excelente trabalho em equipe')
formData.append('photo', photoFile)
formData.append('sessionId', sessionId)
```

**Resposta:**
```json
{
  "feedbackId": "uuid",
  "message": "Feedback enviado com sucesso"
}
```

**Erros:**
- `400` - Campos obrigatórios faltando
- `400` - Funcionário não encontrado ou inativo
- `400` - Formato de imagem inválido
- `500` - Erro ao enviar feedback

---

## Endpoints do Dashboard

### GET /api/dashboard/pending

Retorna feedbacks pendentes de aprovação.

**Resposta:**
```json
{
  "feedbacks": [
    {
      "id": "uuid",
      "from_name": "João Silva",
      "from_setor": "TI",
      "to_name": "Maria Santos",
      "to_setor": "RH",
      "categories": ["Colaboração"],
      "reason": "Excelente trabalho",
      "photo_url": "https://...",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/dashboard/approve

Aprova um feedback.

**Body:**
```json
{
  "feedbackId": "uuid"
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

### POST /api/dashboard/reject

Rejeita um feedback.

**Body:**
```json
{
  "feedbackId": "uuid"
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## Modelos de Dados

### Funcionário (Employee)
```typescript
interface Employee {
  id: string            // UUID
  nome: string          // Nome completo
  setor: string | null  // Setor (opcional)
  ativo: boolean        // Status ativo/inativo
  created_at: string    // Data de criação (ISO 8601)
}
```

### Feedback
```typescript
interface Feedback {
  id: string                    // UUID
  from_name: string             // Nome de quem envia
  from_setor: string | null     // Setor de quem envia
  to_name: string               // Nome de quem recebe
  to_setor: string | null       // Setor de quem recebe
  categories: string[]          // Categorias selecionadas
  reason: string | null         // Motivo do feedback
  photo_url: string             // URL da foto
  status: 'pending' | 'approved' | 'rejected'
  session_id: string            // ID da sessão
  created_at: string            // Data de criação
}
```

### Categorias Disponíveis
- Colaboração
- Proatividade
- Qualidade
- Pontualidade
- Inovação
- Liderança
- Comunicação
- Comprometimento

---

## Códigos de Erro

### 400 - Bad Request
Requisição inválida ou dados faltando.

**Exemplos:**
- Campos obrigatórios não preenchidos
- Funcionário não encontrado
- Formato de arquivo inválido

### 404 - Not Found
Recurso não encontrado.

**Exemplos:**
- Funcionário com ID específico não existe
- Feedback não encontrado

### 500 - Internal Server Error
Erro no servidor.

**Exemplos:**
- Erro ao conectar com o banco de dados
- Erro ao fazer upload de arquivo
- Erro interno não tratado

---

## Compressão de Imagens

Todas as imagens enviadas são automaticamente:
- Redimensionadas para máximo 1920x1920px (mantendo proporção)
- Convertidas para formato WebP
- Comprimidas com qualidade 85%
- Limitadas a 5MB após compressão

**Formatos aceitos:**
- JPEG / JPG
- PNG
- GIF
- WebP

---

## Notas Importantes

1. **Segurança**: Todas as operações de write usam `supabaseAdmin` para bypass de RLS
2. **Validação**: Funcionários devem estar ativos para enviar/receber feedbacks
3. **Sessões**: O `sessionId` é usado para rastreamento e prevenção de duplicatas
4. **Logs**: Todos os erros são logados com prefixo `[dev]` para debug

---

## Exemplos de Uso

### Enviar Feedback (Client-side)

```typescript
const submitFeedback = async (data: FeedbackData) => {
  const formData = new FormData()
  formData.append('fromName', data.fromName)
  formData.append('toName', data.toName)
  formData.append('categories', JSON.stringify(data.categories))
  formData.append('reason', data.reason)
  formData.append('photo', data.photo)
  formData.append('sessionId', data.sessionId)

  const response = await fetch('/api/feedback', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return response.json()
}
```

### Buscar Funcionários Ativos

```typescript
const fetchEmployees = async () => {
  const response = await fetch('/api/employees')
  const data = await response.json()
  return data.employees
}
```

### Aprovar Feedback

```typescript
const approveFeedback = async (feedbackId: string) => {
  const response = await fetch('/api/dashboard/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedbackId })
  })

  return response.json()
}
```

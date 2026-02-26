# Documentação de Componentes

Documentação detalhada dos componentes customizados da aplicação SkyEnergy.

## Índice

- [Componentes de Feedback](#componentes-de-feedback)
  - [EmployeeAutocomplete](#employeeautocomplete)
  - [PhotoUpload](#photoupload)
  - [CategorySelector](#categoryselector)
- [Componentes de RH](#componentes-de-rh)
  - [EmployeeManager](#employeemanager)
  - [FeedbackCard](#feedbackcard)

---

## Componentes de Feedback

### EmployeeAutocomplete

Componente de autocomplete para seleção de funcionários com busca e exibição de setor.

**Localização**: `/components/feedback/employee-autocomplete.tsx`

#### Props

```typescript
interface EmployeeAutocompleteProps {
  label: string                           // Label do campo
  value: string                           // Valor atual do input
  suggestions: Employee[]                 // Lista de sugestões filtradas
  showSuggestions: boolean               // Controle de visibilidade
  onChange: (value: string) => void      // Callback ao digitar
  onSelect: (employee: Employee) => void // Callback ao selecionar
  onClose: () => void                    // Callback ao fechar sugestões
  required?: boolean                     // Campo obrigatório
}

interface Employee {
  id: string
  nome: string
  setor: string | null
}
```

#### Uso

```tsx
<EmployeeAutocomplete
  label="De:"
  value={fromName}
  suggestions={fromSuggestions}
  showSuggestions={showFromSuggestions}
  onChange={handleFromNameChange}
  onSelect={selectFromName}
  onClose={() => setShowFromSuggestions(false)}
  required
/>
```

#### Comportamento

- Filtra funcionários em tempo real
- Limita a 3 sugestões
- Exibe nome em destaque e setor em texto menor
- Fecha ao clicar fora ou selecionar
- Busca case-insensitive
- Exibe setor quando disponível

---

### PhotoUpload

Componente completo para captura/seleção de fotos com compressão automática.

**Localização**: `/components/feedback/photo-upload.tsx`

#### Props

```typescript
interface PhotoUploadProps {
  photoPreview: string                           // URL do preview
  photoSizeWarning: string                       // Mensagem de aviso
  onPhotoChange: (e: ChangeEvent) => void       // Callback seleção arquivo
  onPhotoFromWebcam: (file: File) => void       // Callback captura webcam
  onRemovePhoto: () => void                      // Callback remover foto
}
```

#### Uso

```tsx
<PhotoUpload
  photoPreview={photoPreview}
  photoSizeWarning={photoSizeWarning}
  onPhotoChange={handlePhotoChange}
  onPhotoFromWebcam={handlePhotoFromWebcam}
  onRemovePhoto={() => {
    setPhoto(null)
    setPhotoPreview('')
  }}
/>
```

#### Funcionalidades

**Três modos de captura:**
1. **Câmera Mobile**: Abre câmera nativa (`capture="environment"`)
2. **Webcam Desktop**: Usa `getUserMedia` API para captura ao vivo
3. **Galeria**: Seleção de arquivo padrão

**Compressão automática:**
- Redimensiona para max 1920x1920px
- Converte para WebP (qualidade 85%)
- Mantém aspect ratio original
- Mostra economia de espaço

**Estados:**
- Sem foto: Mostra botões de captura
- Com foto: Mostra preview + opções de troca
- Webcam ativa: Mostra video stream + botão capturar

#### Exemplo de Compressão

```typescript
// Implementação interna
const compressImage = async (file: File): Promise<File> => {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  
  await img.decode()
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Calculate dimensions
  let { width, height } = img
  const maxDim = 1920
  
  if (width > height && width > maxDim) {
    height = (height * maxDim) / width
    width = maxDim
  } else if (height > maxDim) {
    width = (width * maxDim) / height
    height = maxDim
  }
  
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)
  
  // Convert to WebP
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.85)
  })
  
  return new File([blob], 'photo.webp', { type: 'image/webp' })
}
```

---

### CategorySelector

Componente para seleção múltipla de categorias de feedback.

**Localização**: `/components/feedback/category-selector.tsx`

#### Props

```typescript
interface CategorySelectorProps {
  selectedCategories: string[]           // Categorias selecionadas
  onToggleCategory: (category: string) => void  // Callback toggle
}
```

#### Uso

```tsx
<CategorySelector
  selectedCategories={selectedCategories}
  onToggleCategory={toggleCategory}
/>
```

#### Categorias Disponíveis

```typescript
const CATEGORIES = [
  'Colaboração',
  'Proatividade',
  'Qualidade',
  'Pontualidade',
  'Inovação',
  'Liderança',
  'Comunicação',
  'Comprometimento'
]
```

#### Comportamento

- Permite seleção múltipla
- Visual diferenciado para selecionadas
- Grid responsivo (2 colunas mobile, 3+ desktop)
- Checkbox visual integrado

---

## Componentes de RH

### EmployeeManager

Componente completo para gerenciamento CRUD de funcionários.

**Localização**: `/components/hr/employee-manager.tsx`

#### Props

```typescript
interface EmployeeManagerProps {
  employees: Employee[]
  onAddEmployee: (nome: string, setor: string) => Promise<void>
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>
}

interface Employee {
  id: string
  nome: string
  setor: string | null
  ativo: boolean
  created_at: string
}
```

#### Uso

```tsx
<EmployeeManager
  employees={employees}
  onAddEmployee={handleAddEmployee}
  onUpdateEmployee={handleUpdateEmployee}
  onToggleStatus={handleToggleEmployeeStatus}
/>
```

#### Funcionalidades

**Adicionar Funcionário:**
- Form com campos nome e setor
- Validação de campos obrigatórios
- Feedback visual de sucesso/erro

**Listar Funcionários:**
- Lista ordenada por nome
- Exibe nome, setor e status
- Visual diferenciado para inativos

**Editar Funcionário:**
- Modo inline editing
- Edita nome e setor simultaneamente
- Salvar com Enter, cancelar com Escape

**Ativar/Desativar:**
- Toggle de status ativo/inativo
- Confirmação visual
- Soft delete (não remove do banco)

---

### FeedbackCard

Componente para exibição de card de feedback com ações.

**Localização**: `/components/hr/feedback-card.tsx`

#### Props

```typescript
interface FeedbackCardProps {
  feedback: Feedback
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  showActions?: boolean
}

interface Feedback {
  id: string
  from_name: string
  from_setor: string | null
  to_name: string
  to_setor: string | null
  categories: string[]
  reason: string | null
  photo_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
```

#### Uso

```tsx
<FeedbackCard
  feedback={feedback}
  onApprove={handleApproveFeedback}
  onReject={handleRejectFeedback}
  showActions={true}
/>
```

#### Funcionalidades

**Exibição:**
- Foto do feedback em tamanho grande
- Nomes com setores (quando disponível)
- Categorias em badges
- Motivo do feedback
- Data de criação formatada

**Ações (se showActions=true):**
- Botão Aprovar (verde)
- Botão Rejeitar (vermelho)
- Loading states
- Confirmação visual

**Layout:**
- Responsivo
- Imagem clicável para ampliar
- Grid de categorias
- Espaçamento adequado

---

## Patterns e Best Practices

### Estado Local vs Props

**Estado Local**: Use para UI state (hover, focus, loading)
```tsx
const [isHovered, setIsHovered] = useState(false)
```

**Props**: Use para dados e callbacks
```tsx
interface Props {
  data: DataType
  onChange: (value: string) => void
}
```

### Validação

Sempre valide no componente E no servidor:

```tsx
// Component
const isValid = value.trim().length > 0

// Server
if (!nome || !nome.trim()) {
  return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
}
```

### Error Handling

Use toast para feedback ao usuário:

```tsx
try {
  await action()
  toast.success('Sucesso!')
} catch (error) {
  toast.error('Erro ao processar')
  console.error('[dev]', error)
}
```

### Loading States

Desabilite ações durante loading:

```tsx
const [isLoading, setIsLoading] = useState(false)

<Button disabled={isLoading}>
  {isLoading ? 'Carregando...' : 'Enviar'}
</Button>
```

### Accessibility

Sempre inclua labels e ARIA attributes:

```tsx
<Label htmlFor="input-id">Campo</Label>
<Input
  id="input-id"
  aria-required="true"
  aria-describedby="help-text"
/>
```

---

## Testes

Para testar componentes:

```typescript
// Unit test example
describe('EmployeeAutocomplete', () => {
  test('should filter suggestions', () => {
    const employees = [
      { id: '1', nome: 'João', setor: 'TI' },
      { id: '2', nome: 'Maria', setor: 'RH' }
    ]
    
    const searchTerm = 'joão'
    const filtered = employees.filter(emp =>
      emp.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    expect(filtered.length).toBe(1)
    expect(filtered[0].nome).toBe('João')
  })
})
```

---

## Troubleshooting

### Componente não renderiza
- Verifique imports
- Check props types
- Veja console para erros

### Webcam não funciona
- Navegador deve suportar getUserMedia
- HTTPS necessário em produção
- Usuário deve dar permissão

### Compressão falha
- Verifique formato de imagem
- Imagem pode estar corrompida
- Tente outro arquivo

---

## Contribuindo

Ao criar novos componentes:

1. Siga a estrutura de pastas existente
2. Use TypeScript com interfaces claras
3. Documente props e comportamento
4. Adicione testes unitários
5. Use componentes shadcn/ui como base
6. Siga patterns de loading e error handling

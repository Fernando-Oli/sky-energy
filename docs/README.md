# SkyEnergy - Sistema de Reconhecimento

Sistema de reconhecimento de equipes com feedbacks e premiação mensal do Grupo Skyline.

## Visão Geral

O SkyEnergy é uma plataforma web que permite aos funcionários reconhecerem uns aos outros através de feedbacks positivos com fotos. Os feedbacks são moderados pelo RH e contribuem para a premiação mensal dos funcionários mais destacados.

### Funcionalidades Principais

- **Envio de Feedbacks**: Funcionários podem enviar feedbacks com foto para colegas
- **Categorias de Reconhecimento**: 8 categorias incluindo Colaboração, Proatividade, Qualidade, etc.
- **Captura de Fotos**: Suporte para câmera mobile, webcam PC e seleção de galeria
- **Compressão Automática**: Imagens são automaticamente comprimidas e convertidas para WebP
- **Painel de RH**: Dashboard completo para gerenciar funcionários e aprovar feedbacks
- **Gerenciamento de Funcionários**: CRUD completo com setores e status ativo/inativo
- **Histórico de Aprovações**: Visualização de todos os feedbacks aprovados

## Tecnologias Utilizadas

### Frontend
- **Next.js 16**: Framework React com App Router
- **React 19.2**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS 4**: Estilização
- **shadcn/ui**: Componentes UI
- **Sonner**: Notificações toast

### Backend
- **Next.js API Routes**: Endpoints serverless
- **Supabase**: Banco de dados PostgreSQL e storage
- **Vercel Blob**: Storage de imagens

### Ferramentas de Desenvolvimento
- **Bun**: Runtime JavaScript rápido
- **ESLint**: Linting de código

## Estrutura do Projeto

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── employees/          # Endpoints de funcionários
│   │   ├── feedback/           # Endpoint de envio de feedback
│   │   └── dashboard/          # Endpoints do dashboard RH
│   ├── hr/                     # Área do RH
│   │   └── dashboard/          # Dashboard de gestão
│   ├── submit/                 # Página de envio de feedback
│   ├── layout.tsx              # Layout root
│   └── page.tsx                # Página inicial
├── components/
│   ├── feedback/               # Componentes de feedback
│   │   ├── employee-autocomplete.tsx
│   │   ├── photo-upload.tsx
│   │   └── category-selector.tsx
│   ├── hr/                     # Componentes do RH
│   │   ├── employee-manager.tsx
│   │   └── feedback-card.tsx
│   └── ui/                     # Componentes UI base (shadcn)
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   └── feedback.ts             # Lógica de feedback
├── scripts/
│   └── *.sql                   # Scripts SQL do banco
├── docs/                       # Documentação
└── tests/                      # Testes
    ├── unit/                   # Testes unitários
    └── integration/            # Testes de integração
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ ou Bun
- Conta Vercel
- Projeto Supabase

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd sky-energy
```

2. Instale as dependências:
```bash
bun install
# ou
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Blob (opcional, para produção)
BLOB_READ_WRITE_TOKEN=your-blob-token
```

4. Configure o banco de dados:

Execute os scripts SQL em ordem no Supabase SQL Editor:

```sql
-- 1. Criar tabela de funcionários
-- Ver: /scripts/create-employees-table.sql

-- 2. Adicionar coluna setor (se necessário)
-- Ver: /scripts/add-setor-column.sql

-- 3. Criar tabela de feedbacks
-- Ver: /scripts/create-feedbacks-table.sql
```

5. Execute o projeto em desenvolvimento:
```bash
bun dev
# ou
npm run dev
```

Acesse `http://localhost:3000`

## Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente no dashboard
3. Configure a integração Supabase
4. Deploy automático a cada push

### Variáveis de Ambiente de Produção

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLOB_READ_WRITE_TOKEN=
```

## Uso

### Para Funcionários

1. **Acessar**: Navegue para `/submit`
2. **Preencher dados**:
   - Selecione seu nome (De:)
   - Selecione quem receberá o feedback (Para:)
   - Escolha as categorias
   - Adicione um motivo (opcional)
3. **Tirar foto**:
   - Mobile: Use "Câmera" para captura direta
   - PC: Use "Webcam" para capturar da webcam
   - Ou selecione "Galeria" para escolher foto existente
4. **Enviar**: Clique em "Enviar Feedback"

### Para RH

1. **Acessar**: Navegue para `/hr/dashboard`
2. **Feedbacks Pendentes**:
   - Visualize feedbacks aguardando aprovação
   - Aprovar ou Rejeitar cada feedback
3. **Gerenciar Funcionários**:
   - Adicionar novos funcionários
   - Editar nome e setor
   - Ativar/Desativar funcionários
4. **Histórico**:
   - Visualizar feedbacks aprovados

## Funcionalidades Especiais

### Compressão de Imagens

Todas as fotos enviadas são automaticamente:
- Redimensionadas para máximo 1920x1920px
- Convertidas para formato WebP
- Comprimidas com qualidade 85%
- Economia média de 70-90% no tamanho do arquivo

**Compatibilidade**: Funciona em todos os dispositivos modernos, incluindo iOS 14+ e Android.

### Captura de Fotos

**Mobile**:
- Botão "Câmera" abre a câmera nativa do dispositivo
- Suporta câmera frontal e traseira

**Desktop**:
- Botão "Webcam" ativa a webcam do computador
- Preview em tempo real antes de capturar
- Funciona em Chrome, Firefox, Edge, Safari

### Validação de Funcionários

- Sistema valida se funcionários existem e estão ativos
- Impede envio de feedback para funcionários inativos
- Autocomplete com máximo 3 sugestões
- Exibe setor para facilitar identificação

## Segurança

- **RLS (Row Level Security)**: Políticas no Supabase
- **Service Role**: Operações administrativas usam service role key
- **Validação Server-Side**: Todas as validações críticas no backend
- **Upload Seguro**: Validação de tipo e tamanho de arquivo

## Performance

- **Image Optimization**: Compressão automática WebP
- **Code Splitting**: Componentes carregados sob demanda
- **Caching**: Next.js automatic caching
- **Edge Runtime**: Deploy em Vercel Edge Network

## Troubleshooting

### Erro: "Funcionário não encontrado"
- Verifique se o funcionário está cadastrado
- Confirme que o funcionário está ativo
- Check spelling do nome

### Erro: "Arquivo muito grande"
- Sistema comprime automaticamente
- Se ainda assim > 5MB, reduza qualidade da câmera
- Ou tire uma foto menos detalhada

### Webcam não funciona
- Verifique permissões do navegador
- Tente outro navegador (Chrome recomendado)
- Certifique-se que webcam está conectada

### Erros de Database
- Verifique variáveis de ambiente
- Confirme que scripts SQL foram executados
- Check Supabase dashboard para erros

## Suporte

Para problemas ou dúvidas:
1. Consulte a [Documentação da API](./API.md)
2. Verifique logs no console do navegador
3. Entre em contato com o time de desenvolvimento

## Roadmap

- [ ] Sistema de pontuação automático
- [ ] Ranking mensal de funcionários
- [ ] Notificações por email
- [ ] Exportação de relatórios
- [ ] App mobile nativo
- [ ] Integração com outros sistemas

## Licença

Propriedade do Grupo Skyline. Todos os direitos reservados.

## Créditos

Desenvolvido para o Grupo Skyline - Sistema SkyEnergy

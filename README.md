# SkyEnergy - Sistema de Reconhecimento de Equipes

Um sistema inovador de reconhecimento entre colegas que digitaliza o processo de feedback em papel, adicionando validação, categorização e premiação mensal.

## 🎯 Funcionalidades ##

### Para Colaboradores
- **Envio de Feedback**: Tirar foto do papel + preencher dados (opcional)
- **4 Categorias**: Inovação, Empatia, Confiança, Eficiência
- **Múltiplas Categorias**: Um feedback pode marcar múltiplas categorias
- **Dashboard Público**: Ver campeões do mês e sorteio

### Para RH
- **Validação Manual**: Aprovar/rejeitar feedbacks com razão
- **Painel Dedicado**: Interface para gerenciar feedbacks pendentes
- **Autenticação**: Login seguro com sessão de 24h

### Para Todos
- **Visualização de Campeões**: Quem foi mais reconhecido em cada categoria
- **Sorteio Mensal**: Um feedback aleatório é sorteado entre os aprovados

## 🚀 Setup Inicial

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

Você pode encontrar estas informações no seu projeto Supabase em Settings → API.

### 2. Executar Migrações

As migrações SQL já estão configuradas em `/scripts/`. Você pode executar manualmente no Supabase SQL Editor ou solicitar ao dev para fazê-lo.

### 3. Criar Primeiro Usuário RH

No Supabase SQL Editor, execute:

```sql
-- Crie um usuário RH (use um email e senha reais)
INSERT INTO hr_users (email, password_hash, name, is_active) VALUES (
  'rh@empresa.com',
  'hash_da_senha_aqui',
  'RH Manager',
  true
);
```

**Importante**: Você precisará fazer hash da senha. Use a função de hashing do Node.js ou peça ajuda ao dev.

### 4. Configurar Storage

1. Vá para Supabase → Storage
2. Crie um novo bucket chamado `skyenergy-photos`
3. Configure como público
4. Defina MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
5. Limite de arquivo: 50MB

## 📱 Fluxo de Uso

### Colaborador
1. Acesse `/submit`
2. Tire uma foto do feedback em papel
3. Preencha: Seu nome, Nome da pessoa, Categorias
4. Justificativa é opcional
5. Clique em "Enviar Feedback"
6. RH validará e aprovará/rejeitará

### RH
1. Acesse `/hr/login`
2. Faça login com email e senha
3. Veja feedbacks pendentes em `/hr/dashboard`
4. Clique em um feedback para expandir
5. Aprove ou rejeite com justificativa
6. Pronto! O feedback foi processado

### Todos
1. Acesse `/dashboard`
2. Veja os campeões de cada categoria do mês
3. Veja o feedback sorteado
4. Retorne a `/submit` para enviar mais

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `skyenergy_feedback`
Armazena todos os feedbacks enviados.
- `id`: UUID (PK)
- `from_name`: Texto - Quem enviou
- `to_name`: Texto - Para quem
- `category`: Enum - Inovação/Empatia/Confiança/Eficiência
- `reason`: Texto opcional - Justificativa
- `photo_url`: Texto - URL da foto
- `status`: Enum - pending/approved/rejected
- `rejection_reason`: Texto - Motivo da rejeição (se rejeitado)
- `created_at`: Timestamp
- `approved_at`: Timestamp
- `approved_by`: UUID - ID do RH que aprovou
- `month_year`: Texto (YYYY-MM) - Para agrupar por mês
- `created_by_session_id`: Texto - ID da sessão do colaborador

#### `hr_users`
Credenciais dos usuários RH.
- `id`: UUID (PK)
- `email`: Texto único
- `password_hash`: Texto (PBKDF2 com salt)
- `name`: Texto
- `is_active`: Boolean
- `created_at`: Timestamp

#### `sessions`
Sessões ativas de RH.
- `id`: UUID (PK)
- `hr_user_id`: UUID (FK → hr_users)
- `token`: Texto único
- `expires_at`: Timestamp (24 horas)
- `created_at`: Timestamp

#### `storage.buckets` / `storage.objects`
Fotos dos feedbacks armazenadas em bucket.

## 🔐 Segurança

- **Senhas**: PBKDF2 com salt aleatório de 16 bytes
- **Sessões**: Tokens aleatórios de 32 bytes, expiram em 24h
- **Cookies**: HTTP-only, Secure (produção), SameSite=Lax
- **Uploads**: Limitados a MIME types de imagem
- **RLS Policies**: Configuradas para storage público de leitura

## 📊 Prêmios

### Campeão
O colaborador com mais reconhecimentos em cada categoria ganha.
**Se houver empate, ambos ganham!**

### Sorteio
Um feedback aleatório é sorteado entre todos os aprovados do mês.

## 🛠️ Estrutura de Pastas

```
/app
  /api
    /feedback          - Submit feedback
    /dashboard         - Champions & random draw data
    /hr
      /login          - HR authentication
      /me             - Verify session
      /validate       - Approve/reject feedbacks
  /submit             - Colaborador page
  /dashboard          - Public view
  /hr/login           - RH login
  /hr/dashboard       - RH validation panel
  page.tsx            - Home page

/lib
  /supabase.ts        - Supabase client & types
  /auth.ts            - Authentication utilities
  /feedback.ts        - Feedback business logic

/scripts
  /setup-skyenergy.sql - Main database schema
  /setup-storage.sql  - Storage bucket setup
```

## 🔄 Fluxo de Dados

```
Colaborador tira foto
    ↓
Acessa /submit
    ↓
Preenche formulário
    ↓
POST /api/feedback
    ↓
→ Foto é uploadada para storage
→ Feedback criado com status 'pending'
    ↓
RH vê em /hr/dashboard
    ↓
RH clica para expandir
    ↓
RH aprova ou rejeita
    ↓
POST /api/hr/validate
    ↓
→ Status muda para 'approved' ou 'rejected'
    ↓
Dashboard agregará dados de feedbacks 'approved'
    ↓
Campeões e sorteio visíveis em /dashboard
```

## 📝 Notas Importantes

- **Papel não desaparece**: Apenas digitaliza o processo
- **Validação manual**: Porque nem todo feedback escrito é apropriado
- **Foto é opcional**: Se a pessoa já escreveu tudo que precisa
- **Session ID**: Gerado no navegador para rastrear origem
- **Mês automático**: YYYY-MM calculado do timestamp de criação
- **Sortedos incluem foto**: Para contar a história completa

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique as variáveis de ambiente
2. Confirme que o bucket Supabase está criado
3. Verifique os logs da API
4. Limpe cache e cookies do navegador

## 📅 Próximos Passos

- [ ] Criar usuário RH inicial
- [ ] Configurar email de notificações
- [ ] Dashboard de estatísticas para RH
- [ ] Integração com sistema de RH
- [ ] Histórico de prêmios
- [ ] Relatórios mensais

---

**Desenvolvido com ❤️ usando Next.js, Supabase e Tailwind CSS**

# Mathutando

Plataforma colaborativa para **estudar, praticar e partilhar exercícios interativos de matemática**, começando por uma biblioteca de Matemática A.

## Arquitetura (MVP)

```text
apps/web/             React + TypeScript + Vite (Cloudflare Pages)
packages/contracts/   Contratos tipados e validação Zod dos exercícios
supabase/migrations/  PostgreSQL, políticas RLS, exemplos do catálogo
docs/adr/             Decisões de arquitetura
archive/poc/          Protótipo original preservado
```

**Não há backend Java nem Railway na arquitetura ativa.** Supabase fornece autenticação, PostgreSQL e API de dados; as permissões de acesso são aplicadas na base de dados (RLS). A validação e a futura correção de respostas serão protegidas no servidor, nunca confiadas ao browser.

Consulta [a arquitetura e o backend](docs/architecture.md), [as regras de engenharia](AGENTS.md) e [o estudo de referências e design](docs/design/market-study.md).

## Instalação

Requer Node.js 22.

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Sem credenciais, a interface mostra um **catálogo de demonstração**. As contas, publicações, comentários e avaliações ficam indisponíveis.

### Supabase no Docker

Com o Docker a correr e a CLI do Supabase instalada, corre na raiz do repositório:

```bash
supabase start -x studio,logflare,vector
supabase status
```

O arranque aplica as migrações e carrega o exercício de exemplo. Usa o URL local da API e a chave pública devolvidos pela CLI em `apps/web/.env.local`. A caixa [Mailpit local](http://127.0.0.1:54324) recebe os links de entrada. Mantém o frontend em `127.0.0.1:5173` para o link de entrada regressar à aplicação.

```bash
npm run dev --workspace @mathutando/web -- --host 127.0.0.1 --strictPort
```

## Ligar a um projeto Supabase

1. Criar um projeto gratuito em https://supabase.com/dashboard (região europeia, se adequado).
2. Abrir **SQL Editor** e executar, por ordem, os ficheiros `supabase/migrations/*.sql`, ou aplicar as migrações com a CLI Supabase. A segunda migração insere um exercício demonstrativo no catálogo.
3. Em **Authentication > URL Configuration**, definir o URL da app e adicionar os URLs de redirecionamento locais e de produção.
4. Em **Connect / Project Settings > API**, copiar **Project URL** e **publishable key** para `apps/web/.env.local`. Nunca utilizar secret key ou `service_role` no frontend.
5. Reiniciar `npm run dev`, testar catálogo e login por email. O envio de emails pode estar limitado no plano gratuito.

## Cloudflare Pages

Ligar este repositório em **Workers & Pages > Create > Pages > Connect to Git**:

- Branch de produção: `main`.
- **Root directory:** `/` (raiz do repositório).
- **Build command:** `npm install && npm run build`.
- **Build output directory:** `apps/web/dist`.
- **Environment variables:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (publicável, não secret).

Configurar o URL do novo Pages como origem e URL de redirecionamento nas definições de Auth do Supabase. **Este commit não cria projetos externos nem publica automaticamente a aplicação na Cloudflare.**

## Comandos

```bash
npm run dev
npm run build
npm test
npm run typecheck
```

## Funcionalidades

- Biblioteca com pesquisa e filtros de ano e tópico, leitura real do Supabase e pré-visualização de exercícios.
- Autenticação por email OTP (link de acesso) e saída de sessão.
- Feed mínimo com publicação de um exercício existente e texto; comentários e rating de dificuldade associados a um exercício, para utilizadores autenticados.
- Contrato público extensível de exercício com Zod; definições públicas **não incluem soluções**.
- SQL com tópicos, exercícios versionados, tentativas futuras, posts, comentários, ratings, identidade e verificação futura de professores; políticas RLS explícitas.
- CI de TypeScript/build/testes.

## Limites conscientes

**Ainda não há Exercise Studio visual nem motor de resolução/correção.** O feed e os comentários são apenas uma base técnica e não devem ser disponibilizados a menores sem moderação, mecanismos de denúncia e uma política de proteção de dados apropriada. A verificação de professores é um estado reservado ao futuro fluxo administrativo, sem autoatribuição pelo utilizador.

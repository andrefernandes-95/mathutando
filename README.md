# Mathutando

Base de uma plataforma colaborativa para **estudar, praticar e criar exercícios de matemática**. Monorepo com frontend React, backend Java e PostgreSQL.

## Estrutura

```text
apps/
  web/                React + TypeScript + Vite (biblioteca)
  api/                Java 21 + Spring Boot (API REST)
    src/main/java/    módulos catalog / exercises / config
    src/main/resources/db/migration/ (Flyway)
infra/compose.yaml    PostgreSQL para desenvolvimento
docs/adr/             decisões e limites arquiteturais
archive/poc/          protótipo antigo, preservado sem dependências no runtime
.github/workflows/    CI e GitHub Pages
```

## Arrancar localmente

Requer **Node 22**, **Java 21**, **Maven 3.9+**, **Docker/Compose** (ou PostgreSQL local).

```bash
# terminal 1: base de dados
# na raiz do repositório
docker compose -f infra/compose.yaml up -d

# terminal 2: backend (as migrações correm no arranque)
cd apps/api
mvn spring-boot:run

# terminal 3: frontend (na raiz)
npm install
npm run dev:web
```

- Web: http://localhost:5173
- API: http://localhost:8080/api/v1/topics
- Exercícios: http://localhost:8080/api/v1/exercises
- Health: http://localhost:8080/actuator/health

O Vite encaminha `/api` para `localhost:8080` no desenvolvimento, sem hardcoding de URL no UI.

## Testes

```bash
npm run test:web
npm run build:web
cd apps/api && mvn test
```

CI executa testes e build, incluindo um PostgreSQL real para teste de integração futuro. Não existem credenciais de produção no repositório.

## Railway

1. Criar um serviço **PostgreSQL** no projeto Railway.
2. Criar um segundo serviço a partir do mesmo repositório, com **Root Directory = `apps/api`**. O Dockerfile está nessa pasta.
3. No serviço da API, definir variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` usando **referências de variáveis Railway** do serviço PostgreSQL, como `${{Postgres.PGHOST}}` (ajustar ao nome real do serviço). Usar o **host privado**; não publicar a BD.
4. Definir `WEB_ORIGIN` com o domínio HTTPS real do frontend, sem `/` final.
5. Gerar domínio público apenas para a API. `PORT` é fornecida pelo Railway e lida pela aplicação.

O serviço API usa `apps/api/Dockerfile` e `apps/api/railway.json`. O frontend pode ser publicado gratuitamente no GitHub Pages pela Action, após ativar **Settings → Pages → GitHub Actions**. Se a API estiver no Railway, configurar `VITE_API_BASE_URL` para o seu domínio HTTPS na build do frontend (em GitHub Actions: variável de repositório `VITE_API_BASE_URL`).

**Importante:** configurar os serviços no dashboard Railway é manual; este commit não cria instâncias nem acarreta custos. O Railway cobra recursos conforme o plano.

## O que está implementado

- Backend de leitura do catálogo de tópicos e exercícios publicados, com filtros por `year` e `topicId`.
- Migração Flyway com esquema inicial e uma demonstração de exercício de probabilidades.
- Frontend de biblioteca que lê a API; estados de loading/erro/vazio; visualização da definição de uma interação.
- Validação extensível do contrato de exercício na API (para futura criação por aluno, professor ou IA).
- Modelação relacional de posts, comentários, ratings e tentativas, **sem expor endpoints de escrita**.
- Testes unitários de contrato no Java e testes simples de validação no frontend.

## Por fazer (deliberadamente)

Autenticação, criação de exercícios, publicação, comentários, ratings, execução de tentativas e correção segura, verificação de professores, feed e moderação. O schema oferece um ponto de partida — não representa funcionalidades prontas.

## Segurança e contexto escolar

A definição de demonstração é pública e inclui a resposta correta. **Antes do lançamento de exercícios avaliados**, separar o contrato de autor (com gabarito) do contrato do aluno (sem gabarito) e implementar correção no servidor. Não disponibilizar escrita pública nem guardar dados de menores antes de definir identidade e privacidade.

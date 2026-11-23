# ADR 0002: Supabase + Cloudflare Pages

Status: accepted (2026-11-23)

## Decision

Use one TypeScript stack for web and exercise contracts. Host the Vite build on Cloudflare Pages. Use Supabase Auth and Postgres/PostgREST, with PostgreSQL Row Level Security and versioned migrations. No permanently running backend required at MVP stage.

## Boundaries

- `packages/contracts`: provider-agnostic public exercise definition. No answer key is ever part of the public JSON.
- `apps/web`: UI and adapters that read Supabase tables; component interactions must not know SQL or auth credentials.
- `supabase/migrations`: relational entities, controlled access, and seed content.
- Future Exercise Studio uses the same schema, with server-side controlled grading and version publishing, rather than writing arbitrary evaluation rules from a browser.

## Tradeoffs

Advantages: low fixed cost, fast development, one language, built-in identity, real SQL data with RLS.
Risks: Supabase free projects may pause for inactivity, authentication policies require careful review, usage limits, and Cloudflare Pages is a separate hosting service. The schema and public contracts must remain exportable for migration.

## Deferred

Freeform exercise creation, exercise grading, verified teacher workflow, moderation tooling, private classroom, and AI authoring. Public read and user-bound comments/ratings/posts only in this foundation.

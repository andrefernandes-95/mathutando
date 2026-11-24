# Working on Mathutando

These instructions apply to the active React app, shared packages and Supabase code. Treat `archive/poc/` as historical material unless the task explicitly includes it. Read [the architecture notes](docs/architecture.md) before changing a boundary.

## Responsibilities and dependencies

- Apply single responsibility: give each function and module one reason to change. Name it for the behavior it owns. Keep rendering, state coordination, rules and I/O separate where they change independently. A short wrapper is only useful if it owns a boundary or a meaningful behavior.
- Group by feature. Keep feature internals private by default. `App` assembles screens and owns app-level navigation. Components render and forward user intent. Hooks coordinate state and asynchronous work. Pure functions handle decisions that can be tested with inputs and outputs.
- Apply dependency inversion at real boundaries. Keep the dependency direction visible: UI → feature operations → infrastructure adapter. Keep Supabase SDK calls, storage details and row mapping at the adapter boundary. Pass platform-neutral values to components. Domain rules and public contracts must work without React, a database, a browser or environment variables.
- Extend through the smallest existing seam so adding a new interaction or adapter leaves unrelated behavior alone. Add an interface when a consumer needs independent substitutes, multiple implementations or a test seam. Segregate interfaces by consumer and require substitutes to preserve the same behavior, including absence and failure. Prefer functions and explicit dependencies to factories, base classes or container frameworks.
- Share code when two consumers need the same rule and should change together. Keep feature-specific code in its feature. Validate untrusted payloads at the boundary and use typed domain values afterwards.

## Data and server authority

- Supabase Auth establishes identity. Postgres grants and RLS enforce access. Client UI checks are for feedback.
- Published exercise definitions contain prompts and interactions. Keep answer keys, grading decisions, privileged credentials and administrative operations on the server.
- Use a versioned migration for schema or policy changes. Keep operations that must succeed together in one transaction. For retriable writes, decide how duplicate requests are handled. Check application and database behavior for existing rows as well as a fresh local database.
- Add a server use case when it needs private data, trusted decisions or multi-step writes. Keep pure grading logic independently testable and give it a thin server entry point. Avoid adding a network hop solely to move an existing authorised catalog query.

## Tests and review

- Test observable behavior through real production functions or entry points. A second copy of an algorithm in a test proves nothing about the implementation.
- Cover important boundaries and regressions. Test pure rules with ordinary fixtures, adapters at their I/O boundary, and permission changes with the local database and separate user roles. Use a browser for affected UI flows when applicable.
- For application changes, run `npm test` and `npm run build` from the repository root. For visual changes, check phone and desktop widths, keyboard focus, and loading, empty and error states where affected.
- Keep diffs focused. Keep local environment files and generated build output out of commits. Document decisions when they affect subsequent work.

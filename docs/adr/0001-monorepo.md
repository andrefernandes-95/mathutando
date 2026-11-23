# ADR 0001 — Monorepo, monólito modular e conteúdo versionado

**Estado:** aceite para o bootstrap, rever depois do primeiro Creation Studio.

## Decisões

- `apps/web`: React + TypeScript + Vite, UI separada do catálogo e da futura execução de desafios.
- `apps/api`: Java 21, Spring Boot 4.0.10, JDBC + Flyway; monólito modular por capacidade de negócio.
- `infra/compose.yaml`: PostgreSQL 17 para desenvolvimento; PostgreSQL gerido pelo Railway para produção.
- Os exercícios possuem uma **identidade estável** e múltiplas **versões imutáveis** com definição JSONB.
- A versão publicada é referenciada por `published_version`, permitindo revisão sem reescrever tentativas antigas.
- `InteractionDefinitionValidator` funciona como porta para adicionar tipos de interação, começando por `single-choice`.
- Só há endpoints GET públicos. Criar, comentar, avaliar e guardar progresso requer autenticação, autorização, moderação e modelo de avaliação ainda a desenhar.
- Não usamos IA, microserviços, fila, Redis ou motor de ramificações nesta fase.

## Limites importantes

- O frontend **não é a autoridade da correção**; o backend precisará de avaliar respostas e devolver feedback sem expor respostas corretas no payload público. A versão inicial inclui conteúdo público de demonstração e deverá separar a definição de autor da versão de reprodução antes de permitir respostas reais.
- `schemaVersion` protege os contratos e permite migrações futuras.
- Ratings de dificuldade são separados da dificuldade proposta pelo autor.
- Feed/posts são distintos de exercícios; criar um post não duplica o exercício.
- Alterações de schema são feitas exclusivamente por migrações Flyway, sem `ddl-auto`.

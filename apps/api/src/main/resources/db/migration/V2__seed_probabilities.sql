-- Public example for verifying a freshly deployed library. Not a production user submission.
INSERT INTO topics (id, parent_id, slug, name, school_year, sort_order) VALUES
  ('10000000-0000-4000-8000-000000000001', NULL, 'probabilidades', 'Probabilidades', NULL, 1),
  ('10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'probabilidade-condicionada-12', 'Probabilidade condicionada', 12, 1);

INSERT INTO exercises (id, topic_id, title, summary, author_difficulty, status, published_version, published_at)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  'Quem pratica desporto?',
  'Identifica o grupo de referência e calcula uma probabilidade condicionada.',
  2, 'PUBLISHED', 1, now()
);

INSERT INTO exercise_versions (exercise_id, version_number, definition) VALUES (
  '20000000-0000-4000-8000-000000000001', 1,
  '{
    "schemaVersion": 1,
    "statement": "Numa turma de 30 alunos, 10 raparigas e 4 rapazes praticam desporto. Sabendo que o aluno escolhido pratica desporto, qual é a probabilidade de ser rapariga?",
    "steps": [
      {
        "id": "reference-group",
        "prompt": "Qual é o grupo de referência?",
        "interaction": {
          "type": "single-choice",
          "options": [
            {"id": "a", "label": "Os 30 alunos da turma"},
            {"id": "b", "label": "Os 14 alunos que praticam desporto"},
            {"id": "c", "label": "As 18 raparigas"},
            {"id": "d", "label": "Os 12 rapazes"}
          ],
          "correctOptionId": "b"
        },
        "hints": ["Repara na expressão sabendo que.", "Conta apenas os alunos que praticam desporto."]
      }
    ]
  }'::jsonb
);

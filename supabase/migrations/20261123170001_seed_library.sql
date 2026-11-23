-- Demonstration catalogue. The author is intentionally NULL (system seed).
insert into public.topics(id,slug,name,parent_id,school_year,sort_order) values
 ('10000000-0000-4000-8000-000000000001','12-matematica-a','Matemática A',null,12,0),
 ('10000000-0000-4000-8000-000000000002','12-probabilidades','Probabilidades','10000000-0000-4000-8000-000000000001',12,1),
 ('10000000-0000-4000-8000-000000000003','12-prob-condicionada','Probabilidade condicionada','10000000-0000-4000-8000-000000000002',12,2),
 ('10000000-0000-4000-8000-000000000004','12-combinatoria','Combinatória','10000000-0000-4000-8000-000000000001',12,3),
 ('10000000-0000-4000-8000-000000000005','11-geometria','Geometria',null,11,0)
on conflict (slug) do nothing;

insert into public.exercises(id,topic_id,title,summary,author_difficulty,status,current_version,published_at) values (
 '20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000003',
 'O grupo de referência',
 'Descobre como interpretar «sabendo que» numa probabilidade condicionada.',
 2,'published',1,now()
) on conflict do nothing;

-- IMPORTANT: correct options and evaluation criteria are not part of this public document.
insert into public.exercise_versions(exercise_id,version_number,definition) values (
 '20000000-0000-4000-8000-000000000001',1,
 '{"schemaVersion":1,"content":[{"type":"paragraph","text":"Numa turma existem 30 alunos: 18 raparigas e 12 rapazes. Praticam desporto 10 raparigas e 4 rapazes."}],"steps":[{"id":"grupo","title":"Grupo de referência","interaction":{"type":"single-choice","prompt":"Sabendo que um aluno pratica desporto, qual é o grupo de referência?","options":[{"id":"all","label":"Os 30 alunos"},{"id":"girls","label":"As 18 raparigas"},{"id":"athletes","label":"Os 14 praticantes"},{"id":"boys","label":"Os 12 rapazes"}]}},{"id":"casos","title":"Casos favoráveis","interaction":{"type":"numeric-answer","prompt":"Entre os praticantes, quantas são raparigas?","placeholder":"Escreve um número"}}]}'::jsonb
) on conflict do nothing;

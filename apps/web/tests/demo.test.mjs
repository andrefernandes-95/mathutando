import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('schema SQL ativa RLS nas tabelas públicas',()=>{
  const sql=readFileSync(new URL('../../../supabase/migrations/20261123170000_initial.sql',import.meta.url),'utf8');
  const tables=['profiles','teacher_verifications','topics','exercises','exercise_versions','exercise_answer_keys','exercise_attempts','posts','exercise_comments','difficulty_ratings','content_reports'];
  for(const t of tables)assert.ok(sql.includes(`alter table public.${t} enable row level security;`),`${t} sem RLS`);
});
test('chaves de correção não são expostas ao browser',()=>{
  const sql=readFileSync(new URL('../../../supabase/migrations/20261123170000_initial.sql',import.meta.url),'utf8');
  assert.ok(!/grant\s+.*\s+on\s+public\.exercise_answer_keys\s+to\s+(anon|authenticated)/i.test(sql));
});

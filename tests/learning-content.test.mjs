import test from 'node:test';
import assert from 'node:assert/strict';
import { guidedSteps, practiceSteps, guidedScenario, practiceScenario, challengeScenario } from '../src/content/probabilities.ts';
import { parseNumericAnswer, matchesExpectedAnswer } from '../src/lib/answers.ts';

test('cada decisão tem quatro opções únicas, uma correta e pelo menos uma pista', () => {
  for (const step of [...guidedSteps, ...practiceSteps]) {
    assert.equal(step.options.length, 4, step.id);
    assert.equal(new Set(step.options.map(x => x.id)).size, 4, step.id);
    assert.equal(step.options.filter(x => x.id === step.correctId).length, 1, step.id);
    assert.ok(step.hints.length > 0, step.id);
    assert.ok(step.explanation.length > 0, step.id);
  }
});

test('os totais dos cenários correspondem aos enunciados', () => {
  const count = scenario => scenario.rows.reduce((total, row) => total + row.yes + row.no, 0);
  assert.equal(count(guidedScenario), 30);
  assert.equal(count(practiceScenario), 28);
  assert.equal(count(challengeScenario), 40);
  assert.equal(challengeScenario.rows.reduce((total, row) => total + row.yes, 0), 25);
});

test('resposta livre aceita fração, decimal e percentagem', () => {
  for (const answer of ['9/25', '0,36', '0.36', '36%', '36,0 %']) {
    assert.equal(matchesExpectedAnswer(answer, 9 / 25), true, answer);
  }
  for (const answer of ['9/40', '36', '16/25', '9/0', 'texto', '']) {
    assert.equal(matchesExpectedAnswer(answer, 9 / 25), false, answer);
  }
});

test('o analisador recusa frações inválidas', () => {
  assert.equal(parseNumericAnswer('2/0'), null);
  assert.equal(parseNumericAnswer('2/3/4'), null);
  assert.equal(parseNumericAnswer(''), null);
});

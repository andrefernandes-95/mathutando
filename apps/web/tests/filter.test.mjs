import assert from 'node:assert/strict';
import test from 'node:test';
import { descendantIds, filterExercises } from '../src/features/library/filter.ts';

const topics = [
  { id: 'prob', parentId: null, name: 'Probabilidades', schoolYear: 12 },
  { id: 'cond', parentId: 'prob', name: 'Probabilidade condicionada', schoolYear: 12 },
  { id: 'geo', parentId: null, name: 'Geometria', schoolYear: 11 },
];
const exercises = [
  { id: 'a', topicId: 'prob', title: 'Uma moeda', summary: 'Lança a moeda três vezes.' },
  { id: 'b', topicId: 'cond', title: 'O grupo de referência', summary: 'Interpreta «sabendo que».' },
  { id: 'c', topicId: 'geo', title: 'O grupo de referência', summary: 'Localiza o ponto no plano.' },
];
const catalog = { topics, exercises };

test('navega pelos descendentes e termina mesmo se os tópicos formarem um ciclo', () => {
  assert.deepEqual(descendantIds(topics, 'prob'), ['prob', 'cond']);
  const cycle = [{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }];
  assert.deepEqual(descendantIds(cycle, 'a'), ['a', 'b']);
});

test('combina ano, tópico ancestral e pesquisa sem exigir acentos', () => {
  assert.deepEqual(
    filterExercises(catalog, { year: 12, topicId: 'prob', query: ' REFERENCIA   condicionada ' }).map(item => item.id),
    ['b'],
  );
  assert.deepEqual(filterExercises(catalog, { year: 11, topicId: 'prob', query: '' }), []);
});

test('pesquisa pelo resumo ou pelo nome do tópico e mantém a ordem do catálogo', () => {
  assert.deepEqual(
    filterExercises(catalog, { year: null, topicId: '', query: 'plano' }).map(item => item.id),
    ['c'],
  );
  assert.deepEqual(filterExercises(catalog, { year: null, topicId: '', query: '   ' }), exercises);
});

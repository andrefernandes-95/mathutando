import type { Catalog } from './types';

export type CatalogFilters = {
  year: number | null;
  topicId: string;
  query: string;
};

export const defaultFilters: CatalogFilters = { year: null, topicId: '', query: '' };

export function descendantIds(topics: { id: string; parentId: string | null }[], rootId: string): string[] {
  const children = new Map<string, string[]>();
  for (const { id, parentId } of topics) {
    if (!parentId) continue;
    const siblings = children.get(parentId);
    if (siblings) siblings.push(id);
    else children.set(parentId, [id]);
  }

  const visited = new Set<string>();
  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const child of children.get(id) ?? []) visit(child);
  }

  visit(rootId);
  return [...visited];
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-PT');
}

export function filterExercises({ topics, exercises }: Catalog, { year, topicId, query }: CatalogFilters) {
  const topicsById = new Map(topics.map(topic => [topic.id, topic]));
  const allowed = topicId ? new Set(descendantIds(topics, topicId)) : null;
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  return exercises.filter(exercise => {
    const topic = topicsById.get(exercise.topicId);
    if (year !== null && topic?.schoolYear !== year) return false;
    if (allowed && !allowed.has(exercise.topicId)) return false;
    if (terms.length === 0) return true;
    const searchable = normalize([exercise.title, exercise.summary, topic?.name ?? ''].join(' '));
    return terms.every(term => searchable.includes(term));
  });
}

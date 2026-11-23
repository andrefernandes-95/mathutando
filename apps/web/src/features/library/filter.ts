/** Descendentes dos tópicos para pesquisa na biblioteca (sem suposições sobre profundidade). */
export function descendantIds(topics: { id: string; parentId: string | null }[], rootId: string): string[] {
  const children = new Map<string, string[]>();
  for (const topic of topics) {
    if (topic.parentId) children.set(topic.parentId, [...(children.get(topic.parentId) ?? []), topic.id]);
  }
  const result: string[] = [];
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    result.push(id);
    for (const child of children.get(id) ?? []) visit(child);
  };
  visit(rootId);
  return result;
}

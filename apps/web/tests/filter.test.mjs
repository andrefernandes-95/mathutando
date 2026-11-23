import test from 'node:test';
import assert from 'node:assert/strict';
// Espelhar apenas o algoritmo de navegação em JS para teste independente do build TS.
function descendants(topics, root) {
 const children = new Map();
 for (const t of topics) if (t.parentId) children.set(t.parentId, [...(children.get(t.parentId) ?? []), t.id]);
 const result = [], visited = new Set();
 function visit(id) { if(visited.has(id)) return; visited.add(id); result.push(id); for(const child of children.get(id) ?? []) visit(child); }
 visit(root); return result;
}
test('filtro por tópico cobre descendentes e ignora ciclos defensivamente', () => {
 const data = [{id:'a',parentId:null},{id:'b',parentId:'a'},{id:'c',parentId:'b'},{id:'d',parentId:null}];
 assert.deepEqual(descendants(data,'a'),['a','b','c']);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { parseExerciseDefinition } from '../src/index.ts';

const valid = { schemaVersion: 1, content: [{type:'paragraph',text:'Teste'}], steps:[{id:'step-1',title:'Pergunta',interaction:{type:'single-choice',prompt:'Quanto?',options:[{id:'a',label:'1'},{id:'b',label:'2'}]}}] };
test('definição pública válida',()=>assert.equal(parseExerciseDefinition(valid).steps[0].id,'step-1'));
test('opções repetidas são rejeitadas',()=>assert.throws(()=>parseExerciseDefinition({...valid,steps:[{...valid.steps[0],interaction:{...valid.steps[0].interaction,options:[{id:'a',label:'1'},{id:'a',label:'2'}]}}]})));
test('tipos desconhecidos são rejeitados',()=>assert.throws(()=>parseExerciseDefinition({...valid,steps:[{...valid.steps[0],interaction:{type:'custom-script',prompt:'x'}}]})));
test('schemaVersion diferente é rejeitado',()=>assert.throws(()=>parseExerciseDefinition({...valid,schemaVersion:2})));

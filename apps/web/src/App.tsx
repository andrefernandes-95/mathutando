import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Compass, Database, GraduationCap, RefreshCw } from 'lucide-react';
import { getExercise, listExercises, listTopics } from './features/library/api';
import { descendantIds } from './features/library/filter';
import type { ExerciseDetail, ExerciseSummary, Topic } from './features/library/types';

function useLibrary() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [nonce, reload] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setStatus('loading');
    Promise.all([listTopics(abort.signal), listExercises({}, abort.signal)])
      .then(([t, e]) => { if (!abort.signal.aborted) { setTopics(t); setExercises(e); setStatus('ready'); } })
      .catch(() => { if (!abort.signal.aborted) setStatus('error'); });
    return () => abort.abort();
  }, [nonce]);
  return { topics, exercises, status, reload: () => reload(x => x + 1) };
}

function ExercisePreview({ exercise, onClose }: { exercise: ExerciseSummary; onClose: () => void }) {
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    getExercise(exercise.id, abort.signal).then(setDetail).catch(() => { if (!abort.signal.aborted) setError(true); });
    return () => abort.abort();
  }, [exercise.id]);
  return <section className="preview" aria-label="Pré-visualização do exercício">
    <div className="preview-head"><strong>{exercise.title}</strong><button onClick={onClose}>Fechar</button></div>
    {error ? <p>Não foi possível carregar este exercício.</p>
      : !detail ? <p>A carregar enunciado…</p>
      : <>
        <p>{exercise.summary}</p>
        <div className="preview-note">Esta página é a base da biblioteca; o Learning Runtime será implementado separadamente.</div>
        {typeof detail.definition === 'object' && detail.definition !== null && 'steps' in detail.definition && Array.isArray(detail.definition.steps) && detail.definition.steps.map((step: unknown, index: number) => {
          if (typeof step !== 'object' || step === null || !('prompt' in step) || typeof step.prompt !== 'string') return null;
          return <div className="preview-step" key={index}><small>ETAPA {index+1}</small><p>{step.prompt}</p></div>;
        })}
      </>}
  </section>;
}

export function App() {
  const { topics, exercises, status, reload } = useLibrary();
  const [year, setYear] = useState<number | null>(null);
  const [topicId, setTopicId] = useState('');
  const [selected, setSelected] = useState<ExerciseSummary | null>(null);
  const visibleTopics = useMemo(() => topics.filter(t => year === null || t.schoolYear === year || (t.schoolYear === null && topics.some(child => child.parentId === t.id && child.schoolYear === year))), [topics, year]);
  const visibleExercises = useMemo(() => {
    const descendantSet = topicId ? new Set(descendantIds(topics, topicId)) : null;
    return exercises.filter(e => (!descendantSet || descendantSet.has(e.topicId)) && (year === null || topics.some(t => t.id === e.topicId && t.schoolYear === year)));
  }, [topicId, topics, exercises, year]);
  return <div className="shell">
    <header className="header"><div className="header-inner"><div className="logo"><span>∑</span> mathutando<span className="dot">.</span></div><div className="header-right"><span className="stage">BASE DE INFRAESTRUTURA</span><span className="avatar"><GraduationCap size={20}/></span></div></div></header>
    <main className="main">
      <div className="intro"><div className="eyebrow"><Compass size={15}/> BIBLIOTECA DE MATEMÁTICA</div><h1>O que queres <em>aprender</em> hoje?</h1><p>Escolhe um tópico, descobre exercícios e aprende uma etapa de cada vez.</p></div>
      <div className="layout"><aside className="sidebar"><div className="side-title"><BookOpen size={17}/> Explorar</div><label htmlFor="school-year">Ano escolar</label><div className="select-wrap"><select id="school-year" value={year ?? ''} onChange={e=>{setYear(e.target.value ? Number(e.target.value) : null);setTopicId('');setSelected(null);}}><option value="">Todos os anos</option>{[10,11,12].map(y=><option key={y} value={y}>{y}.º ano</option>)}</select><ChevronDown size={16}/></div><label htmlFor="topic">Tópico</label><div className="select-wrap"><select id="topic" value={topicId} onChange={e=>{setTopicId(e.target.value);setSelected(null);}}><option value="">Todos os tópicos</option>{visibleTopics.map(t=><option key={t.id} value={t.id}>{t.parentId?'↳ ':''}{t.name}</option>)}</select><ChevronDown size={16}/></div><p className="sidebar-note">Os exercícios são partilhados entre biblioteca e futuro feed. A biblioteca é o ponto de partida.</p></aside>
      <section className="results"><div className="results-head"><div><h2>Exercícios</h2><p>Escolhe um desafio da comunidade.</p></div><span className="count">{status==='ready'?`${visibleExercises.length} disponível(is)`:'—'}</span></div>
      {status==='loading' && <div className="empty"><Database size={25}/><p>A ligar à biblioteca…</p></div>}
      {status==='error' && <div className="empty"><Database size={25}/><h3>A API não está disponível</h3><p>Confirma se o backend Java está a correr e se o frontend tem o URL correto.</p><button onClick={reload}><RefreshCw size={16}/> Tentar novamente</button></div>}
      {status==='ready' && visibleExercises.length===0 && <div className="empty"><BookOpen size={25}/><h3>Ainda não há exercícios aqui</h3><p>Experimenta mudar os filtros. O catálogo será construído com o nosso Creation Engine.</p></div>}
      {status==='ready' && visibleExercises.map(exercise => <article key={exercise.id} className="exercise-card"><div className="card-top"><span className="pill">Dificuldade proposta · {exercise.authorDifficulty}/5</span><span className="small">V{exercise.currentVersion}</span></div><h3>{exercise.title}</h3><p>{exercise.summary}</p><button className="open" onClick={()=>setSelected(exercise)}>Abrir enunciado <ChevronRight size={16}/></button></article>)}
      {selected && <ExercisePreview key={selected.id} exercise={selected} onClose={()=>setSelected(null)}/>}</section></div>
      <footer>Mathutando · Primeira fundação · sem autenticação nem IA</footer>
    </main>
  </div>;
}

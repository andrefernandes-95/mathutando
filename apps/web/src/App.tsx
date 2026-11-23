import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Compass, GraduationCap, LogIn, LogOut, MessageSquareText, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from './features/auth/useAuth';
import { AuthDialog } from './features/auth/AuthDialog';
import { FeedView } from './features/feed/FeedView';
import { listExercises, listTopics } from './features/library/api';
import { ExerciseDetails } from './features/library/ExerciseDetails';
import { descendantIds } from './features/library/filter';
import type { ExerciseSummary, Topic } from './features/library/types';
import { isConfigured, supabase } from './shared/supabase';
import 'katex/dist/katex.min.css';

function useLibrary(){
  const [topics,setTopics]=useState<Topic[]>([]);const [exercises,setExercises]=useState<ExerciseSummary[]>([]);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');const [error,setError]=useState('');const [nonce,reload]=useState(0);
  useEffect(()=>{let active=true;setStatus('loading');Promise.all([listTopics(),listExercises()]).then(([t,e])=>{if(active){setTopics(t);setExercises(e);setStatus('ready');}}).catch(e=>{if(active){setStatus('error');setError(e instanceof Error?e.message:'Erro ao carregar o catálogo');}});return()=>{active=false;};},[nonce]);
  return {topics,exercises,status,error,reload:()=>reload(x=>x+1)};
}

export function App(){
  const {topics,exercises,status,error,reload}=useLibrary();
  const {user}=useAuth();
  const [view,setView]=useState<'library'|'feed'>('library');const [loginOpen,setLoginOpen]=useState(false);
  const [year,setYear]=useState<number|null>(null);const [topicId,setTopicId]=useState('');
  const [selected,setSelected]=useState<ExerciseSummary|null>(null);
  const visibleTopics=useMemo(()=>topics.filter(t=>year===null||t.schoolYear===year),[topics,year]);
  const visibleExercises=useMemo(()=>{
    const allowed=topicId?new Set(descendantIds(topics,topicId)):null;
    return exercises.filter(e=>(!allowed||allowed.has(e.topicId))&&(year===null||topics.some(t=>t.id===e.topicId&&t.schoolYear===year)));
  },[exercises,topicId,topics,year]);
  function openExercise(exercise:ExerciseSummary){setSelected(exercise);}
  return <div className="shell">
    <header className="header"><div className="header-inner"><button className="logo" onClick={()=>{setView('library');setSelected(null);}} aria-label="Início Mathutando"><span>∑</span> mathutando<b className="dot">.</b></button><nav className="main-nav" aria-label="Navegação principal"><button className={view==='library'?'active':''} onClick={()=>{setView('library');setSelected(null);}}><BookOpen size={16}/> Biblioteca</button><button className={view==='feed'?'active':''} onClick={()=>{setView('feed');setSelected(null);}}><MessageSquareText size={16}/> Feed</button></nav><div className="header-right">{user?<button className="user-button" onClick={()=>void supabase?.auth.signOut()} title="Terminar sessão"><GraduationCap size={17}/><span>Sair</span><LogOut size={14}/></button>:<button className="user-button" onClick={()=>setLoginOpen(true)}><LogIn size={16}/> Entrar</button>}</div></div></header>
    <main className="main">
      {!isConfigured&&<div className="demo-banner"><ShieldAlert size={18}/><div><strong>Modo de demonstração</strong> — a biblioteca mostra dados ilustrativos. Para ativar contas, comentários e publicações, liga o Supabase em <code>apps/web/.env.local</code>.</div></div>}
      {view==='library'&&!selected&&<><div className="intro"><div className="eyebrow"><Compass size={15}/> BIBLIOTECA DE MATEMÁTICA</div><h1>O que queres <em>aprender</em> hoje?</h1><p>Escolhe um tópico, explora exercícios e prepara a tua próxima conquista.</p></div><div className="layout"><aside className="sidebar"><div className="side-title"><BookOpen size={17}/> Explorar</div><label htmlFor="school-year">Ano escolar</label><div className="select-wrap"><select id="school-year" value={year??''} onChange={e=>{setYear(e.target.value?Number(e.target.value):null);setTopicId('');setSelected(null);}}><option value="">Todos os anos</option>{[10,11,12].map(y=><option key={y} value={y}>{y}.º ano</option>)}</select><ChevronDown size={16}/></div><label htmlFor="topic">Tópico</label><div className="select-wrap"><select id="topic" value={topicId} onChange={e=>{setTopicId(e.target.value);setSelected(null);}}><option value="">Todos os tópicos</option>{visibleTopics.map(t=><option key={t.id} value={t.id}>{t.parentId?'↳ ':''}{t.name}</option>)}</select><ChevronDown size={16}/></div><p className="sidebar-note">Encontra exercícios diretamente aqui ou a partir de uma publicação no feed.</p></aside><section className="results"><div className="results-head"><div><h2>Exercícios</h2><p>Escolhe um desafio da biblioteca.</p></div><span className="count">{status==='ready'?`${visibleExercises.length} exercício(s)`:'—'}</span></div>
      {status==='loading'&&<div className="empty">A carregar biblioteca…</div>}
      {status==='error'&&<div className="empty"><ShieldAlert size={25}/><h3>Não foi possível consultar a biblioteca</h3><p>{error}</p><button onClick={reload}><RefreshCw size={16}/> Repetir</button></div>}
      {status==='ready'&&!visibleExercises.length&&<div className="empty"><BookOpen size={25}/><h3>Sem exercícios neste tópico</h3><p>Experimenta outros filtros.</p></div>}
      {status==='ready'&&visibleExercises.map(exercise=><article key={exercise.id} className="exercise-card"><div className="card-top"><span className="pill">Dificuldade proposta · {exercise.authorDifficulty}/5</span><span className="small">Versão {exercise.currentVersion}</span></div><h3>{exercise.title}</h3><p>{exercise.summary}</p><button className="open" onClick={()=>openExercise(exercise)}>Explorar exercício <ChevronRight size={16}/></button></article>)}
      </section></div></>}
      {view==='feed'&&status==='ready'&&!selected&&<FeedView exercises={exercises} userId={user?.id} onOpen={openExercise} onAuthRequested={()=>setLoginOpen(true)}/>}
      {view==='feed'&&status==='error'&&<div className="empty">Não foi possível abrir o feed: {error}</div>}
      {selected&&<div className="detail-overlay"><ExerciseDetails key={selected.id} exercise={selected} userId={user?.id} onClose={()=>setSelected(null)} onAuthRequested={()=>setLoginOpen(true)}/></div>}
      <footer>Mathutando · Biblioteca colaborativa · {isConfigured?'Ligado ao Supabase':'Modo de demonstração'}</footer>
    </main>
    {loginOpen&&<AuthDialog onClose={()=>setLoginOpen(false)}/>}
  </div>;
}

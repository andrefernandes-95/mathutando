import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, BookOpen, MessageCircle, Star, AlertCircle } from 'lucide-react';
import katex from 'katex';
import { addComment, getComments, getDifficulty, getExercise, setDifficulty } from './api';
import { isConfigured } from '../../shared/supabase';
import type { DifficultyStats, ExerciseComment, ExerciseDetail, ExerciseSummary } from './types';

function Formula({latex}:{latex:string}){
  return <span className="math-formula" dangerouslySetInnerHTML={{__html:katex.renderToString(latex,{throwOnError:false,trust:false,output:'html'})}}/>;
}
function formatDate(value:string){return new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:'short'}).format(new Date(value));}

export function ExerciseDetails({exercise,userId,onClose,onAuthRequested}:{exercise:ExerciseSummary;userId?:string;onClose:()=>void;onAuthRequested:()=>void}){
  const [detail,setDetail]=useState<ExerciseDetail|null>(null);
  const [comments,setComments]=useState<ExerciseComment[]>([]);
  const [stats,setStats]=useState<DifficultyStats>({count:0,average:null,myRating:null});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true;
    setDetail(null);setComments([]);setError('');
    Promise.all([getExercise(exercise),getComments(exercise.id),getDifficulty(exercise.id,userId)])
      .then(([d,c,s])=>{if(active){setDetail(d);setComments(c);setStats(s);}})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:'Erro a carregar exercício');});
    return ()=>{active=false;};
  },[exercise.id,userId]);

  async function sendComment(e:FormEvent){
    e.preventDefault();
    if(!userId){onAuthRequested();return;}
    if(!message.trim())return;
    setBusy(true);setError('');
    try{await addComment(exercise.id,userId,message);setMessage('');setComments(await getComments(exercise.id));}
    catch(e){setError(e instanceof Error?e.message:'Erro ao publicar comentário');}
    finally{setBusy(false);}
  }
  async function rate(n:number){
    if(!userId){onAuthRequested();return;}
    setError('');
    try{await setDifficulty(exercise.id,userId,n);setStats(await getDifficulty(exercise.id,userId));}
    catch(e){setError(e instanceof Error?e.message:'Erro a avaliar dificuldade');}
  }
  return <section className="detail" aria-label="Exercício expandido">
    <button className="text-button" onClick={onClose}><ArrowLeft size={16}/> Voltar à biblioteca</button>
    <div className="detail-title"><div className="eyebrow"><BookOpen size={15}/> EXERCÍCIO INTERATIVO</div><h2>{exercise.title}</h2><p>{exercise.summary}</p></div>
    {error&&<p className="inline-error" role="alert"><AlertCircle size={15}/>{error}</p>}
    {!detail&&!error&&<div className="info-box">A carregar exercício…</div>}
    {detail&&<>
      <div className="read-blocks">
        {detail.definition.content.map((block,i)=>block.type==='paragraph'?<p key={i}>{block.text}</p>:<div key={i}><Formula latex={block.latex}/></div>)}
      </div>
      <div className="info-box">As interações são apenas uma <strong>pré-visualização</strong>. O motor de resolução e a avaliação segura das respostas serão implementados a seguir. Não mostramos o gabarito no browser.</div>
      <div className="steps-list">{detail.definition.steps.map((step,i)=><section key={step.id} className="step-preview"><div className="step-meta">ETAPA {i+1} · {step.interaction.type==='single-choice'?'Escolha múltipla':'Resposta numérica'}</div><h3>{step.title}</h3><p>{step.interaction.prompt}</p>
        {step.interaction.type==='single-choice'?<div className="option-preview">{step.interaction.options.map(o=><span key={o.id}>{o.label}</span>)}</div>:<input aria-label="Exemplo de campo de resposta" placeholder={step.interaction.placeholder??'Resposta'} disabled/>}
      </section>)}</div>
    </>}
    <div className="detail-community"><div className="community-head"><h3><Star size={17}/> Dificuldade sentida</h3><span>{stats.average===null?'Sem avaliações':`${stats.average.toFixed(1)}/5 · ${stats.count} avaliações`}</span></div>
      <div className="rating-row">{[1,2,3,4,5].map(n=><button key={n} type="button" className={`rating-button ${stats.myRating===n?'rated':''}`} disabled={!isConfigured} onClick={()=>void rate(n)} aria-label={`Avaliar dificuldade ${n} de 5`}>{n}</button>)}<small>{!isConfigured?'Disponível após ligar Supabase':!userId?'Inicia sessão para avaliar':'Escolhe a dificuldade que sentiste'}</small></div>
      <h3><MessageCircle size={17}/> Comentários</h3>
      {comments.length?comments.map(c=><div className="comment" key={c.id}><strong>{c.authorName}</strong><small>{formatDate(c.createdAt)}</small><p>{c.body}</p></div>):<p className="muted">Ainda não há comentários. Podes iniciar a conversa.</p>}
      <form onSubmit={e=>void sendComment(e)} className="comment-form"><label htmlFor="comment-input">Partilha uma dúvida ou explicação</label><textarea id="comment-input" maxLength={1000} rows={3} disabled={!isConfigured||busy} value={message} onChange={e=>setMessage(e.target.value)} placeholder="O que achaste deste exercício?"/><button className="primary" type="submit" disabled={!isConfigured||busy||!message.trim()}>{userId?'Comentar':'Entrar para comentar'}</button></form>
    </div>
  </section>;
}

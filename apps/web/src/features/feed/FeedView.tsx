import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquareText, Plus, Send, RefreshCw } from 'lucide-react';
import { listFeed, publishPost, type FeedPost } from './api';
import type { ExerciseSummary } from '../library/types';
import { isConfigured } from '../../shared/supabase';

export function FeedView({exercises,userId,onOpen,onAuthRequested}:{exercises:ExerciseSummary[];userId?:string;onOpen:(e:ExerciseSummary)=>void;onAuthRequested:()=>void}){
  const [posts,setPosts]=useState<FeedPost[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [exerciseId,setExerciseId]=useState('');
  const [body,setBody]=useState('');
  const [sending,setSending]=useState(false);
  const [revision,refresh]=useState(0);
  useEffect(()=>{let active=true;setLoading(true);setError('');listFeed(exercises).then(p=>{if(active)setPosts(p);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Não foi possível carregar o feed.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[exercises,revision]);
  async function submit(e:FormEvent){e.preventDefault();if(!userId){onAuthRequested();return;}if(!exerciseId||!body.trim())return;setSending(true);setError('');try{await publishPost(userId,exerciseId,body);setBody('');setExerciseId('');refresh(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'Não foi possível publicar.');}finally{setSending(false);}}
  return <section className="feed-page"><div className="results-head"><div><h2>Comunidade</h2><p>Publica um exercício com uma ideia, pergunta ou desafio.</p></div><MessageSquareText color="#238363"/></div>
    <form className="composer" onSubmit={e=>void submit(e)}><div className="composer-title"><Plus size={17}/> Partilhar exercício</div><label htmlFor="post-exercise">Escolhe um exercício da biblioteca</label><select id="post-exercise" value={exerciseId} onChange={e=>setExerciseId(e.target.value)} disabled={!isConfigured||sending}><option value="">Seleciona…</option>{exercises.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select><label htmlFor="post-text">O que queres dizer?</label><textarea id="post-text" maxLength={500} rows={3} value={body} onChange={e=>setBody(e.target.value)} disabled={!isConfigured||sending} placeholder="Tenho uma dúvida interessante sobre este exercício…"/><div className="form-actions"><small>{body.length}/500</small><button type="submit" className="primary" disabled={!isConfigured||sending||!exerciseId||!body.trim()}><Send size={15}/> {userId?'Publicar':'Iniciar sessão para publicar'}</button></div></form>
    {error&&<div className="inline-error" role="alert">{error} <button className="text-button" onClick={()=>refresh(v=>v+1)}><RefreshCw size={14}/> Tentar novamente</button></div>}
    {loading&&<div className="empty">A carregar publicações…</div>}
    {!loading&&!posts.length&&<div className="empty"><MessageSquareText size={26}/><h3>A comunidade começa aqui</h3><p>Ainda não existem publicações. A biblioteca já tem exercícios para descobrir.</p></div>}
    {!loading&&posts.map(post=><article key={post.id} className="feed-post"><div className="feed-author"><strong>{post.authorName}</strong><small>{new Date(post.createdAt).toLocaleDateString('pt-PT')}</small></div><p>{post.body}</p>{post.exercise&&<button className="shared-exercise" onClick={()=>onOpen(post.exercise!)}><strong>{post.exercise.title}</strong><span>{post.exercise.summary}</span><span>Ver exercício →</span></button>}</article>)}
  </section>;
}

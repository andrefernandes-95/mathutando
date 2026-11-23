import { isConfigured, requireClient } from '../../shared/supabase';
import type { ExerciseSummary } from '../library/types';

export type FeedPost={id:string;authorId:string;authorName:string;exerciseId:string;body:string;createdAt:string;exercise:ExerciseSummary|null};
export async function listFeed(exercises:ExerciseSummary[]):Promise<FeedPost[]>{
  if(!isConfigured)return [];
  const client=requireClient();
  const {data,error}=await client.from('posts').select('id,author_id,exercise_id,body,created_at').eq('status','published').order('created_at',{ascending:false}).limit(50);
  if(error)throw error;
  const rows=data as {id:string;author_id:string;exercise_id:string;body:string;created_at:string}[];
  const ids=[...new Set(rows.map(x=>x.author_id))];
  let names=new Map<string,string>();
  if(ids.length){const p=await client.from('profiles').select('id,display_name').in('id',ids);if(p.error)throw p.error;names=new Map((p.data as {id:string;display_name:string}[]).map(x=>[x.id,x.display_name]));}
  const exerciseById=new Map(exercises.map(e=>[e.id,e]));
  return rows.map(x=>({id:x.id,authorId:x.author_id,authorName:names.get(x.author_id)??'Utilizador',exerciseId:x.exercise_id,exercise:exerciseById.get(x.exercise_id)??null,body:x.body,createdAt:x.created_at}));
}
export async function publishPost(userId:string,exerciseId:string,body:string){
  const {error}=await requireClient().from('posts').insert({author_id:userId,exercise_id:exerciseId,body:body.trim()});
  if(error)throw error;
}

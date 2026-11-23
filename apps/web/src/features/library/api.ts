import { parseExerciseDefinition } from '@mathutando/contracts';
import { isConfigured, requireClient } from '../../shared/supabase';
import { demoDetail, demoExercise, demoTopics } from './demo';
import type { DifficultyStats, ExerciseComment, ExerciseDetail, ExerciseSummary, Topic } from './types';

type TopicRow = { id: string; parent_id: string | null; slug: string; name: string; school_year: number | null; sort_order: number };
type ExerciseRow = { id: string; title: string; summary: string; topic_id: string; author_difficulty: number; current_version: number; published_at: string | null; author_id: string | null };

export const mapTopic = (row: TopicRow): Topic => ({ id: row.id, parentId: row.parent_id, slug: row.slug, name: row.name, schoolYear: row.school_year, sortOrder: row.sort_order });
export const mapExercise = (row: ExerciseRow): ExerciseSummary => ({ id: row.id, title: row.title, summary: row.summary, topicId: row.topic_id, authorDifficulty: row.author_difficulty, currentVersion: row.current_version, publishedAt: row.published_at, authorId: row.author_id });

export async function listTopics(): Promise<Topic[]> {
  if (!isConfigured) return demoTopics;
  const { data, error } = await requireClient().from('topics').select('id,parent_id,slug,name,school_year,sort_order').order('sort_order').limit(300);
  if (error) throw error;
  return (data as TopicRow[]).map(mapTopic);
}

export async function listExercises(): Promise<ExerciseSummary[]> {
  if (!isConfigured) return [demoExercise];
  const { data, error } = await requireClient().from('exercises').select('id,title,summary,topic_id,author_difficulty,current_version,published_at,author_id').eq('status','published').order('published_at',{ascending:false}).limit(200);
  if (error) throw error;
  return (data as ExerciseRow[]).map(mapExercise);
}

export async function getExercise(exercise: ExerciseSummary): Promise<ExerciseDetail> {
  if (!isConfigured) return demoDetail;
  const { data, error } = await requireClient().from('exercise_versions').select('definition').eq('exercise_id',exercise.id).eq('version_number',exercise.currentVersion).single();
  if (error) throw error;
  return { exercise, definition: parseExerciseDefinition(data.definition) };
}

export async function getComments(exerciseId: string): Promise<ExerciseComment[]> {
  if (!isConfigured) return [];
  const client=requireClient();
  const {data,error}=await client.from('exercise_comments').select('id,author_id,body,created_at').eq('exercise_id',exerciseId).order('created_at',{ascending:false}).limit(100);
  if(error) throw error;
  const rows=data as {id:string;author_id:string;body:string;created_at:string}[];
  const authors=[...new Set(rows.map(x=>x.author_id))];
  let names=new Map<string,string>();
  if(authors.length){ const result=await client.from('profiles').select('id,display_name').in('id',authors);if(result.error)throw result.error;names=new Map((result.data as {id:string;display_name:string}[]).map(x=>[x.id,x.display_name])); }
  return rows.map(x=>({id:x.id,authorId:x.author_id,authorName:names.get(x.author_id)??'Utilizador',body:x.body,createdAt:x.created_at}));
}

export async function addComment(exerciseId:string,userId:string,body:string){
  const {error}=await requireClient().from('exercise_comments').insert({exercise_id:exerciseId,author_id:userId,body:body.trim()});
  if(error) throw error;
}

export async function getDifficulty(exerciseId:string,userId?:string):Promise<DifficultyStats>{
  if(!isConfigured)return {count:0,average:null,myRating:null};
  const {data,error}=await requireClient().from('difficulty_ratings').select('difficulty,user_id').eq('exercise_id',exerciseId).limit(5000);
  if(error)throw error;
  const rows=data as {difficulty:number;user_id:string}[];
  return { count:rows.length, average:rows.length?rows.reduce((s,x)=>s+x.difficulty,0)/rows.length:null, myRating:rows.find(x=>x.user_id===userId)?.difficulty??null };
}

export async function setDifficulty(exerciseId:string,userId:string,difficulty:number){
  const {error}=await requireClient().from('difficulty_ratings').upsert({exercise_id:exerciseId,user_id:userId,difficulty},{onConflict:'exercise_id,user_id'});
  if(error)throw error;
}

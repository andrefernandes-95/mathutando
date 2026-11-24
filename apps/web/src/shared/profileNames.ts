import { requireClient } from './supabase';

export async function fetchProfileNames(authorIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(authorIds)];
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await requireClient()
    .from('profiles')
    .select('id,display_name')
    .in('id', uniqueIds);
  if (error) throw error;

  const profiles = data as { id: string; display_name: string }[];
  return new Map(profiles.map(profile => [profile.id, profile.display_name]));
}

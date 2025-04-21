// lib/createProject.ts
import { supabase } from './supabaseClient';

export const createProject = async (payload: Record<string, unknown>) => {
  const { error } = await supabase.from('projects').insert(payload);
  if (error) throw error;
};

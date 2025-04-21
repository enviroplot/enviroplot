// lib/uploadFile.ts
import { supabase } from './supabaseClient';

export const uploadFile = async (
  bucket: 'site-maps' | 'logos' | 'coc',
  file: File,
  projectCode: string
) => {
  const path = `${projectCode}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
};

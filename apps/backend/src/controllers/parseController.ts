import supabase from '../services/supabaseClient.js';

export const parseEsdat = async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) throw error;
    res.status(200).json({ message: 'ESdat parsed successfully', sample: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse ESdat' });
  }
};

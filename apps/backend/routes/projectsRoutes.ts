import express from 'express';
import { supabase } from '../services/supabaseClient';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(500).json({ error });
  res.status(200).json({ message: 'Project updated' });
});

export default router;

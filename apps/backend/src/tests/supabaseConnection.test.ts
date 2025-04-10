export {}
import supabase from '../services/supabaseClient.js';

describe('Supabase Connection Test', () => {
  test('should fetch data from your_table', async () => {
    const { data, error } = await supabase.from('projects').select();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

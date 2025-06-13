export {}

jest.mock('../services/supabaseClient', () => {
  return {
    supabase: {
      from: () => ({
        select: async () => ({ data: [{ id: 1 }], error: null }),
      }),
    },
  }
})

import { supabase } from '../services/supabaseClient'

describe('Supabase Connection Test', () => {
  test('should fetch data from your_table', async () => {
    const { data, error } = await supabase.from('projects').select();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

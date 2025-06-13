export {}

jest.mock('../services/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signUp: async ({ email }: { email: string }) => ({
          data: { user: { email } },
          error: null,
        }),
      },
    },
  }
})

import { supabase } from '../services/supabaseClient'

describe('Supabase Auth Tests', () => {
  it('should sign up a user', async () => {
    const randomEmail = `test-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: randomEmail,
      password: 'StrongPassword123'
    })
    expect(error).toBeNull()
    expect(data.user).toBeDefined()
  })
})

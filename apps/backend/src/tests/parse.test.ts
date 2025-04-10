import request from 'supertest'
import app from '../app'
import { jest } from '@jest/globals'

// Mock the Supabase client
jest.mock('../services/supabaseClient')
const supabase = require('../services/supabaseClient')

describe('POST /api/parse/esdat', () => {
  it('should respond with sample data', async () => {
    // Ensure each method returns a chainable promise:
    supabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({
          data: [{ id: 1 }],
          error: null,
        })),
      })),
    }));

    // **Notice the corrected endpoint here:**
    const res = await request(app)
      .post('/api/parse/esdat')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('sample');
  });
});

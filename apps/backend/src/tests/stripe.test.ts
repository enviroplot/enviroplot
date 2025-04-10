import request from 'supertest'
import app from '../app'

describe('POST /api/stripe/webhook', () => {
  it('should acknowledge webhook', async () => {
    const res = await request(app)
      .post('/api/stripe/webhook') // Confirm that stripeRoutes sets up a POST on '/webhook'
      .send({})

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('received', true)
  })
})

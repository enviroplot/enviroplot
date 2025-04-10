import request from 'supertest'
import app from '../app'

describe('POST /api/export/excel', () => {
  it('should export Excel', async () => {
    const res = await request(app)
      .post('/api/export/excel') // Confirm this endpoint in exportRoutes
      .send({})

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message', 'Excel exported')
  })
})

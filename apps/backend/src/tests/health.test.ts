import request from 'supertest'
import app from '../app'

describe('GET /', () => {
  it('should return health check message', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('status', 'ok')
  })
})
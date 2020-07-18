import request from 'supertest'

import app from '../../src/app'
import truncate from '../utils/truncate'
import factory from '../factories'

describe('ROUTE /sessions', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should NOT be able to authenticate with invalid password', async () => {
    const user = await factory.create('User', {
      password: '123456'
    })

    const response = await request(app)
      .post('/sessions')
      .send({
        username: user.username,
        password: '111114'
      })

    expect(response.status).toBe(400)
  })

  it('should be able to authenticate with valid password', async () => {
    const user = await factory.create('User', {
      password: '123456'
    })

    const response = await request(app)
      .post('/sessions')
      .send({
        username: user.username,
        password: '123456'
      })

    expect(response.status).toBe(200)
  })

  it('should NOT be able to authenticate with invalid username', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        username: 'invalidusername',
        password: '123456'
      })

    expect(response.status).toBe(400)
  })

  it('should NOT be able to authenticate with invalid inputs', async () => {
    // inputs are too shorts
    const response = await request(app)
      .post('/sessions')
      .send({
        username: 'ab',
        password: 'cb'
      })

    expect(response.status).toBe(400)
  })

  it('should return a jwt token when authenticated', async () => {
    const user = await factory.create('User', {
      password: '123456'
    })

    const response = await request(app)
      .post('/sessions')
      .send({
        username: user.username,
        password: '123456'
      })

    expect(response.body).toHaveProperty('token')
  })

  it('should NOT be able to access private routes without a jwt token', async () => {
    const response = await request(app)
      .get('/tweets')

    expect(response.status).toBe(401)
  })

  it('should be able to access private routes with valid token', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .get('/tweets')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(200)
  })

  it('should NOT be able to access private routes with invalid token', async () => {
    const response = await request(app)
      .get('/tweets')
      .set('Authorization', 'Bearer invalidtoken')

    expect(response.status).toBe(401)
  })
})

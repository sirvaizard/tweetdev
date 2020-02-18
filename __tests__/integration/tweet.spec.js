import request from 'supertest'

import app from '../../src/app'
import truncate from '../utils/truncate'
import factory from '../factories'
import faker from 'faker'

describe('ROUTE /tweets', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should be able to create tweet with less than 256 characters', async () => {
    const user = await factory.create('User')

    const response = await request(app).post('/tweets')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        author_id: user.id,
        content: faker.lorem.words(10)
      })

    expect(response.status).toBe(201)
  })

  it('should NOT be able to create tweet with more than 256 characters', async () => {
    const user = await factory.create('User')

    const response = await request(app).post('/tweets')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        author_id: user.id,
        content: faker.lorem.words(120),
        language: 'all'
      })

    expect(response.status).toBe(400)
  })

  it('should be able to show a tweet that exists', async () => {
    const user = await factory.create('User')
    const tweet = await factory.create('Tweet', {
      author_id: user.id
    })

    const response = await request(app).get(`/tweets/${tweet.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(200)
    expect(response.body.content).toBe(tweet.content)
  })

  it('should NOT be able to show a tweet that does not exists', async () => {
    const user = await factory.create('User')

    const response = await request(app).get('/tweets/254654848')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should be able to delete an existing tweet', async () => {
    const user = await factory.create('User')
    const tweet = await factory.create('Tweet', {
      author_id: user.id
    })

    const response = await request(app)
      .delete(`/tweets/${tweet.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(200)
  })

  it('should NOT be able to delete an nonexistent tweet', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .delete('/tweets/nonexistenttweet')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should NOT be able to delete a tweet that is not your own', async () => {
    const user = await factory.create('User')
    const userTwo = await factory.create('User', { username: 'aaaaaaa', email: '123121@fdsfsdf.com' })

    const tweet = await factory.create('Tweet', {
      author_id: userTwo.id
    })

    const response = await request(app)
      .delete(`/tweets/${tweet.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(401)
  })
})

import request from 'supertest'

import app from '../../src/app'
import truncate from '../utils/truncate'
import factory from '../factories'

describe('ROUTE /feed', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should be able to show user tweets with correct pagination', async () => {
    const user = await factory.create('User')

    await factory.createMany('Tweet', 18, {
      author_id: user.id
    })

    let response = await request(app)
      .get(`/feed/${user.id}?page=1`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.body.length).toBe(10)

    response = await request(app)
      .get(`/feed/${user.id}?page=2`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.body.length).toBe(8)
  })

  it('should be able to show user feed with correct pagination', async () => {
    const firstUser = await factory.create('User', {
      username: 'firstuser',
      email: 'first@first.com'
    })

    const secondUser = await factory.create('User', {
      username: 'seconduser',
      email: 'second@second.com'
    })

    const thirdUser = await factory.create('User', {
      username: 'thirduser',
      email: 'third@third.com'
    })

    await factory.createMany('Tweet', 5, {
      author_id: firstUser.id
    })

    await factory.createMany('Tweet', 5, {
      author_id: secondUser.id
    })

    await factory.createMany('Tweet', 5, {
      author_id: thirdUser.id
    })

    await request(app)
      .post(`/users/${secondUser.id}/follow`)
      .set('Authorization', `Bearer ${firstUser.generateToken()}`)

    await request(app)
      .post(`/users/${thirdUser.id}/follow`)
      .set('Authorization', `Bearer ${firstUser.generateToken()}`)

    let response = await request(app)
      .get('/feed?page=1')
      .set('Authorization', `Bearer ${firstUser.generateToken()}`)

    expect(response.body.length).toBe(10)

    response = await request(app)
      .get('/feed?page=2')
      .set('Authorization', `Bearer ${firstUser.generateToken()}`)

    expect(response.body.length).toBe(5)
  })
})

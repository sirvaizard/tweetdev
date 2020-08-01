import request from 'supertest'

import Followers from '../../src/app/models/Followers'

import app from '../../src/app'
import truncate from '../utils/truncate'
import factory from '../factories'

describe('ROUTE /follower', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should be able to follow an existing user', async () => {
    const userOne = await factory.create('User')
    const userTwo = await factory.create('User', { username: 'teeest', email: 'teest@test.com' })

    const response = await request(app)
      .post(`/users/${userTwo.id}/follow`)
      .set('Authorization', `Bearer ${userOne.generateToken()}`)

    expect(response.status).toBe(201)
  })

  it('should NOT be able to follow a nonexistent user', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .post('/users/3333/follow')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should not be able to follow someone that user already follows', async () => {
    const userOne = await factory.create('User')
    const userTwo = await factory.create('User', { username: 'teeest', email: 'teest@test.com' })
    await Followers.create({ follower_id: userOne.id, following_id: userTwo.id })

    const response = await request(app)
      .post(`/users/${userTwo.id}/follow`)
      .set('Authorization', `Bearer ${userOne.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should NOT be able to unfollow an user that not exists', async () => {
    const userOne = await factory.create('User')

    const response = await request(app)
      .delete('/users/nonexistentid/unfollow')
      .set('Authorization', `Bearer ${userOne.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should be able to unfollow someone that user follows', async () => {
    const userOne = await factory.create('User')
    const userTwo = await factory.create('User', { username: 'teeest', email: 'teest@test.com' })
    await Followers.create({ follower_id: userOne.id, following_id: userTwo.id })

    const response = await request(app)
      .delete(`/users/${userTwo.id}/unfollow`)
      .set('Authorization', `Bearer ${userOne.generateToken()}`)

    expect(response.status).toBe(200)
  })

  it('should NOT be able to unfollow someone that user does not follows', async () => {
    const userOne = await factory.create('User')
    const userToUnfollow = await factory.create('User', { username: 'teeest', email: 'teest@test.com' })

    const response = await request(app)
      .delete(`/users/${userToUnfollow.id}/unfollow`)
      .set('Authorization', `Bearer ${userOne.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should NOT be able to follow yourself', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .post(`/users/${user.id}/follow`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.status).toBe(400)
  })

  it('should return false if user does not follow some specific user', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .get('/users/9999999/following')
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.body.following).toBe(false)
  })

  it('should return true if user does follow some specific user', async () => {
    const user = await factory.create('User')
    const userToFollow = await factory.create('User', { username: 'teest', email: 'teest@test.com' })
    await Followers.create({ follower_id: user.id, following_id: userToFollow.id })

    const response = await request(app)
      .get(`/users/${userToFollow.id}/following`)
      .set('Authorization', `Bearer ${user.generateToken()}`)

    expect(response.body.following).toBe(true)
  })
})

import request from 'supertest'
import faker from 'faker'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

import File from '../../src/app/models/File'

import app from '../../src/app'
import truncate from '../utils/truncate'
import factory from '../factories'

describe('ROUTE /users', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(() => {
    /**
    * delete the uploads folder content
    */
    const folder = path.resolve(__dirname, '..', '..', 'tmp', 'uploads')
    fs.readdir(folder, (err, files) => {
      if (err) throw err

      for (const file of files) {
        const stat = fs.statSync(path.join(folder, file))
        if (stat.isFile()) {
          fs.unlink(path.join(folder, file), err => {
            if (err) throw err
          })
        }
      }
    })
  })

  it('should be able to create user with valid inputs', async () => {
    const payload = {
      username: faker.internet.userName(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }

    const response = await request(app).post('/users').send(payload)

    const user = response.body

    expect(user.username).toBe(payload.username)
    expect(user.name).toBe(payload.name)
    expect(user.email).toBe(payload.email)
    expect(response.status).toBe(201)
  })

  it('should NOT be able to create user with invalid inputs', async () => {
    const response = await request(app).post('/users').send({
      username: 'vv',
      name: 'dsad'
    })

    expect(response.status).toBe(400)
  })

  it('should NOT be able to create user with username or email that already exists', async () => {
    const payload = {
      username: faker.internet.userName(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }

    await request(app).post('/users').send(payload)

    const response = await request(app).post('/users').send(payload)

    expect(response.status).toBe(400)
  })

  it('should be able to update user with valid inputs', async () => {
    const user = await factory.create('User')

    const payload = {
      username: faker.internet.userName(),
      name: faker.name.findName(),
      password: '123456',
      password_confirmation: '123456'
    }

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .attach('avatar', path.resolve(__dirname, '..', 'assets', 'avatar.jpg'))
      .send(payload)

    expect(response.status).toBe(200)
  })

  it('should NOT be able to update user with invalid inputs', async () => {
    const user = await factory.create('User')

    await factory.create('User', {
      username: 'jotaro',
      email: 'jotaro@stardustcrusader.com'
    })

    const payload = {
      username: 'jotaro',
      name: faker.name.findName(),
      password: '123456',
      password_confirmation: '12344556'
    }

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .attach('avatar', path.resolve(__dirname, '..', 'assets', 'avatar.jpg'))
      .field('username', payload.username)
      .field('name', payload.name)
      .field('password', payload.password)
      .field('password_confirmation', payload.password_confirmation)
      .send(payload)

    expect(response.status).toBe(400)
  })

  it('should NOT be able to update user\'s username to one that already exists', async () => {
    const user = await factory.create('User')
    await factory.create('User', {
      username: 'existingtuser',
      email: 'existingtuser@mrrobot.com'
    })

    const payload = {
      username: 'existingtuser'
    }

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(payload)

    expect(response.status).toBe(400)
  })

  it('should be able to show user with valid id', async () => {
    const payload = {
      username: faker.internet.userName(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }

    const { body } = await request(app).post('/users').send(payload)

    const response = await request(app).get(`/users/${body.id}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(body.id)
  })

  it('should NOT be able to show user that does not exists', async () => {
    const response = await request(app).get('/users/25413')

    expect(response.status).toBe(400)
  })

  it('should NOT be able to show use with invalid id', async () => {
    const response = await request(app).get('/users/string')

    expect(response.status).toBe(400)
  })

  it('should delete old avatar file when upload a new one', async () => {
    const user = await factory.create('User')

    await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .attach('avatar', path.resolve(__dirname, '..', 'assets', 'avatar.jpg'))
      .field('name', 'victoooor')

    await user.reload()

    const file = await File.findByPk(user.avatar_id)

    await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .attach('avatar', path.resolve(__dirname, '..', 'assets', 'avatar.jpg'))

    const filePath = path.resolve(__dirname, '..', '..', 'tmp', 'uploads', file.name)

    let fileExists
    try {
      await promisify(fs.access)(filePath, fs.constants.F_OK)
      fileExists = true
    } catch (err) {
      fileExists = false
    }

    expect(fileExists).toBe(false)
  })

  it('should not be able to upload files that are not jpg or png', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .attach('avatar', path.resolve(__dirname, '..', 'assets', 'picture.invalid.format'))

    expect(response.status).toBe(400)
  })
})

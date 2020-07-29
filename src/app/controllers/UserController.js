import Joi from '@hapi/joi'
import { Op } from 'sequelize'
import fs from 'fs'
import path from 'path'

import User from '../models/User'
import File from '../models/File'

class UserController {
  async show (req, res) {
    const schema = Joi.object({
      username: Joi.string().required()
    })

    const validation = schema.validate(req.params)

    if (validation.error) {
      return res.status(400).json({ error: validation.error })
    }

    const { username } = req.params

    const user = await User.findOne({
      where: {
        username
      },
      attributes: ['id', 'name', 'username', 'email', 'avatar_id', 'github', 'bio'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'name', 'url']
      }
    })

    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    return res.status(200).json(user)
  }

  async store (req, res) {
    const schema = Joi.object({
      username: Joi.string().min(3).required(),
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })

    const validation = schema.validate(req.body, { abortEarly: false })

    if (validation.error) {
      return res.status(400).json(validation.error.details.map(error => error.message))
    }

    const checkUserExists = await User.findOne({
      where: {
        [Op.or]: [{ username: req.body.username }, { email: req.body.email }]
      }
    })

    if (checkUserExists) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const { id, name, username, email, avatar_id, github, bio } = await User.create(req.body)

    return res.status(201).send({ id, name, username, email, avatar_id, github, bio })
  }

  async update (req, res) {
    const schema = Joi.object({
      username: Joi.string().min(3),
      name: Joi.string().min(3),
      email: Joi.string().email(),
      password: Joi.string().min(6),
      github: Joi.string(),
      bio: Joi.string()
    })

    const validation = schema.validate(req.body, { abortEarly: false })

    if (req.fileError) {
      return res.status(400).json({ error: req.fileError })
    }

    if (validation.error) {
      return res.status(400).json(validation.error.details.map(error => error.message))
    }

    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'username', 'email', 'avatar_id', 'github', 'bio'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'name', 'url']
      }
    })

    if (req.body.username) {
      const checkUsernameExists = await User.findOne({ where: { username: req.body.username } })

      if (checkUsernameExists && checkUsernameExists.username !== user.username) {
        return res.status(400).json({ error: 'Username already exists' })
      }
    }

    if (req.file) {
      if (user.avatar_id) {
        const avatar = await File.findByPk(user.avatar_id)
        const oldAvatarPath = path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', avatar.name)

        await avatar.update({ name: req.file.filename })

        fs.unlink(oldAvatarPath, (err) => {
          if (err) throw err
        })
      } else {
        const avatar = await File.create({ name: req.file.filename })
        req.body.avatar_id = avatar.id
      }
    }

    await user.update(req.body)

    return res.json(user)
  }
}

export default new UserController()

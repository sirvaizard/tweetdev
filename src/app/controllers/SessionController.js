import Joi from '@hapi/joi'

import User from '../models/User'
import File from '../models/File'

class SessionController {
  async store (req, res) {
    const schema = Joi.object({
      username: Joi.string().min(3).required(),
      password: Joi.string().min(6).required()
    })

    const validation = schema.validate(req.body)

    if (validation.error) {
      return res.status(400).json({ error: validation.error })
    }

    const { username, password } = req.body

    const user = await User.findOne({
      where: { username },
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'name', 'url']
      }
    })

    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    if (!(await user.checkPassword(password))) {
      return res.status(400).json({ error: 'Invalid password' })
    }

    const { id, name, email, bio, github, avatar } = user

    return res.status(200).json({
      user: {
        id,
        name,
        email,
        bio,
        github,
        avatar
      },
      token: user.generateToken()
    })
  }
}

export default new SessionController()

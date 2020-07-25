import Tweet from '../models/Tweet'
import Followers from '../models/Followers'
import User from '../models/User'
import File from '../models/File'

import { activeConnections } from '../services/sockets'

class TweetController {
  async index (req, res) {
    return res.status(200).json()
  }

  async show (req, res) {
    const { id } = req.params

    const tweet = await Tweet.findByPk(id)

    if (!tweet) {
      return res.status(400).json({ error: 'Tweet does not exists' })
    }

    return res.status(200).json(tweet)
  }

  async store (req, res) {
    const { content, language } = req.body

    if (content.length > 256) {
      return res.status(400).json({ error: 'Tweet has more than 256 characters' })
    }

    const { id } = await Tweet.create({
      content,
      author_id: req.userId,
      language
    })

    const tweet = await Tweet.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'name', 'avatar_id'],
        include: [{
          model: File,
          as: 'avatar',
          attributes: ['name', 'url']
        }]
      }]
    })

    const idsFromConnectedSockets = [...activeConnections.keys()]

    const userFollowers = await Followers.findAll({
      attributes: ['follower_id'],
      where: {
        following_id: req.userId
      }
    })

    userFollowers.forEach(user => {
      const id = String(user.follower_id)

      if (idsFromConnectedSockets.includes(id)) {
        const userSocket = activeConnections.get(id)
        if (userSocket) {
          userSocket.emit('get tweet', tweet)
        }
      }
    })

    return res.status(201).json(tweet)
  }

  async destroy (req, res) {
    const { id } = req.params

    const tweet = await Tweet.findByPk(id)

    if (!tweet) {
      return res.status(400).json({ error: 'Tweet does not exists' })
    }

    if (tweet.author_id !== req.userId) {
      return res.status(401).json({ error: 'You are not the owner of this tweet' })
    }

    await tweet.destroy()

    return res.status(200).json()
  }
}

export default new TweetController()

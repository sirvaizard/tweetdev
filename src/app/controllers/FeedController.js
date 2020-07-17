import Tweet from '../models/Tweet'
import User from '../models/User'
import File from '../models/File'
import { Op } from 'sequelize'

class FeedController {
  async index (req, res) {
    const { page } = req.query

    const following = await User.findByPk(req.userId).then(user => user.getFollower())

    const followingIds = following.map(user => user.id)

    const tweets = await Tweet.findAll({
      where: {
        author_id: {
          [Op.or]: [...followingIds, req.userId]
        }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'name', 'avatar_id'],
        include: [{
          model: File,
          as: 'avatar',
          attributes: ['name', 'url']
        }]
      }],
      order: [
        ['created_at', 'DESC']
      ],
      limit: 10,
      offset: 10 * (page - 1)
    })

    return res.json(tweets)
  }

  async show (req, res) {
    const { id } = req.params
    const { page } = req.query

    const tweets = await Tweet.findAll({
      where: {
        author_id: id
      },
      order: [
        ['created_at', 'DESC']
      ],
      limit: 10,
      offset: 10 * (page - 1)
    })

    return res.json(tweets)
  }
}

export default new FeedController()

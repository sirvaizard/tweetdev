import User from '../models/User'
import Followers from '../models/Followers'

class FollowerController {
  async show (req, res) {
    const { id } = req.params

    const isFollowing = await Followers.findOne({
      where: {
        follower_id: req.userId,
        following_id: id
      }
    })

    if (!isFollowing) {
      return res.status(200).json({ following: false })
    }

    return res.status(200).json({ following: true })
  }

  async store (req, res) {
    const { toFollowId } = req.params

    if (Number(toFollowId) === Number(req.userId)) {
      return res.status(400).json({ error: 'You cannot follow yourself' })
    }

    const user = await User.findByPk(toFollowId)

    if (!user) {
      return res.status(400).json({ error: 'User does not exists ' })
    }

    const isFollowing = await Followers.findOne({
      where: {
        follower_id: req.userId,
        following_id: toFollowId
      }
    })

    if (isFollowing) {
      return res.status(400).json({ error: 'User already is a follower' })
    }

    const follow = await Followers.create({
      follower_id: req.userId,
      following_id: toFollowId
    })

    return res.status(201).json(follow)
  }

  async destroy (req, res) {
    const { toUnfollowId } = req.params

    const checkUserExistence = await User.findByPk(toUnfollowId)

    if (!checkUserExistence) {
      return res.status(400).json({ error: 'User does not exists' })
    }

    const isFollowing = await Followers.findOne({
      where: {
        follower_id: req.userId,
        following_id: toUnfollowId
      }
    })

    if (!isFollowing) {
      return res.status(400).json({ error: 'You do not follow this user' })
    }

    await isFollowing.destroy()

    return res.status(200).json()
  }
}

export default new FollowerController()

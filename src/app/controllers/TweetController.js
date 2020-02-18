import Tweet from '../models/Tweet'

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

    const tweet = await Tweet.create({
      content,
      author_id: req.userId,
      language
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

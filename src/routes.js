import { Router } from 'express'
import multer from 'multer'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import TweetController from './app/controllers/TweetController'
import FollowController from './app/controllers/FollowController'
import FeedController from './app/controllers/FeedController'

import authMiddleware from './app/middlewares/auth'

import multerConfig from './config/multer'

const upload = multer(multerConfig)
const routes = new Router()

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

routes.use(authMiddleware)

routes.get('/tweets', TweetController.index)
routes.get('/tweets/:id', TweetController.show)
routes.post('/tweets', TweetController.store)
routes.delete('/tweets/:id', TweetController.destroy)

routes.get('/users/:username', UserController.show)
routes.put('/users', upload.single('avatar'), UserController.update)

routes.get('/users/:id/following', FollowController.show)
routes.post('/users/:toFollowId/follow', FollowController.store)
routes.delete('/users/:toUnfollowId/unfollow', FollowController.destroy)

routes.get('/feed', FeedController.index)
routes.get('/feed/:id', FeedController.show)

export default routes

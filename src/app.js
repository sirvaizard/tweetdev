import { config } from 'dotenv'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'

import { socketServer } from './app/services/sockets'
import routes from './routes'
import './database'

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

class App {
  constructor () {
    this.server = express()

    this.middlewares()
    this.routes()

    this.server = createServer(this.server)
    socketServer(this.server)
  }

  middlewares () {
    this.server.use(cors())
    this.server.use(express.json())
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    )
  }

  routes () {
    this.server.use(routes)
  }
}

export default new App().server

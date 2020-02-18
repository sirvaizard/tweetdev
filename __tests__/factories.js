import faker from 'faker'
import { factory } from 'factory-girl'

import User from '../src/app/models/User'
import Tweet from '../src/app/models/Tweet'

factory.define('User', User, {
  username: faker.internet.userName(),
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password()
})

factory.define('Tweet', Tweet, {
  content: faker.lorem.words(5),
  language: 'all'
})

export default factory

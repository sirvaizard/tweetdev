import Sequelize from 'sequelize'

import databaseConfig from '../config/database'
import models from '../app/models'

class Database {
  constructor () {
    this.init()
  }

  init () {
    this.sequelize = new Sequelize(databaseConfig)
    models.forEach(model => model.init(this.sequelize))
    models.forEach(model => model.associate && model.associate(this.sequelize.models))
  }
}

export default new Database()

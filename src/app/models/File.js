import Sequelize, { Model } from 'sequelize'

class File extends Model {
  static init (sequelize) {
    super.init({
      name: Sequelize.STRING,
      url: {
        type: Sequelize.VIRTUAL,
        get () {
          return `${process.env.APP_URL}:${process.env.PORT || 3333}/files/${this.name}`
        }
      }
    }, {
      sequelize
    })
  }
}

export default File

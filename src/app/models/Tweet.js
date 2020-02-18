import Sequelize, { Model } from 'sequelize'

class Tweet extends Model {
  static init (sequelize) {
    super.init({
      author_id: Sequelize.INTEGER,
      content: Sequelize.STRING(256),
      language: Sequelize.STRING
    }, {
      sequelize
    })
  }

  static associate (models) {
    this.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' })
  }
}

export default Tweet

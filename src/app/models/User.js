import Sequelize, { Model } from 'sequelize'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

class User extends Model {
  static init (sequelize) {
    super.init({
      username: Sequelize.STRING,
      name: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.VIRTUAL,
      password_hash: Sequelize.STRING,
      github: Sequelize.STRING,
      bio: Sequelize.STRING
    }, {
      sequelize
    })

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8)
      }
    })
  }

  static associate (models) {
    this.belongsToMany(models.User, {
      through: 'Followers',
      as: 'follower',
      foreignKey: 'follower_id'
    })

    this.belongsToMany(models.User, {
      through: 'Followers',
      as: 'following',
      foreignKey: 'following_id'
    })

    this.belongsTo(models.File, {
      foreignKey: 'avatar_id',
      as: 'avatar'
    })
  }

  checkPassword (password) {
    return bcrypt.compare(password, this.password_hash)
  }

  generateToken () {
    return jwt.sign({ id: this.id }, process.env.APP_SECRET)
  }
}

export default User

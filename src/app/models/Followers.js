import { Model } from 'sequelize'

class Followers extends Model {
  static init (sequelize) {
    super.init({}, {
      sequelize
    })
  }
}

export default Followers

import bcrypt from 'bcryptjs'

import truncate from '../utils/truncate'
import factory from '../factories'

describe('User', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should encrypt user password', async () => {
    const user = await factory.create('User', {
      password: '123456'
    })

    const comparedHash = await bcrypt.compare('123456', user.password_hash)

    expect(comparedHash).toBe(true)
  })
})

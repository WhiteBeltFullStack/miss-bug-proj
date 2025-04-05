import Cryptr from 'cryptr'
import { userService } from './userService.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-pass-1234')

export const authService = {
  checkLogin,
  getLoginToken,
  validateToken,
}

function checkLogin({ username, password }) {
    console.log('username:',username)
    console.log('password:',password)
  return userService.getByUsername(username).then(user => {
    if (user && user.password === password) {
      user = { ...user }
      delete user.password
      return Promise.resolve(user)
    }
    return Promise.reject()
  })
}

function getLoginToken(user) {
  const str = JSON.stringify(user)
  const encryptedStr = cryptr.encrypt(str)
  return encryptedStr
}

function validateToken(token) {
  if (!token) return null

  const str = cryptr.decrypt(token)
  const user = JSON.parse(str)
  return user
}

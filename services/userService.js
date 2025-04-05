import fs from 'fs'
import { utilService } from './util.service.js'

const users = utilService.readJsonFile('data/user.json')

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add,
}

function query() {
  const usersToReturn = users.map(user => ({
    _id: user._id,
    fullname: user.fullname,
  }))
  return Promise.resolve(usersToReturn)
}

function getById(userId) {
  var user = users.find(user => user._id === userId)
  if (!user) return Promise.reject('User Not Found!')
  user = { ...user }
  delete user.password

  return Promise.resolve(user)
}

function getByUsername(username) {
  var user = users.find(user => username === user.username)
  return Promise.resolve(user)
}

function remove(userId) {
  users = users.filter(user => userId !== user._id)
  return _saveUsersToFile
}

function add(user) {
  return getByUsername(user.username).then(existingUser => {
    if (existingUser) return Promise.reject('Username Taken')
    console.log('existingUser:', existingUser)
    user._id = utilService.makeId()

    users.push(user)
    return _saveUsersToFile().then(() => {
      user = { ...user }
      delete user.password
      return user
    })
  })
}

function _saveUsersToFile() {
  return new Promise((resolve, rejects) => {
    const userStr = JSON.stringify(users, null, 2)
    fs.writeFile('data/user.json', userStr, err => {
      if (err) {
        return console.log('err:', err)
      }
      resolve()
    })
  })
}

import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bugService.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/userService.js'
import { authService } from './services/auth.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// LIST

app.get('/api/bug', (req, res) => {
  const filterBy = {
    txt: req.query.txt || '',
    minSeverity: req.query.minSeverity || 0,
    pageIdx: +req.query.pageIdx,
    sortBy: req.query.sortBy || 'severity',
    sortDir: req.query.sortDir || -1,
  }
  bugService
    .query(filterBy)
    .then(({ bugs, totalCount, totalPages }) =>
      res.send({ bugs, totalCount, totalPages })
    )
    .catch(err => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

app.get('/api/bug/download', (req, res) => {
  bugService.generatePdf(res)
  // res.send('downloaded')
})

// CREATE

app.post('/api/bug', (req, res) => {
  // const bugToSave = {
  //   _id: req.query._id,
  //   severity: +req.query.severity,
  // }

  const loggedInUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedInUser) return res.status(401).send('Cannot Add Bug')
  const bugToSave = req.body

  bugService
    .save(bugToSave, loggedInUser)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot Add bug', err)
      res.status(500).send('Cannot add bugs')
    })
})

// EDIT or Update
app.put('/api/bug/:bugId', (req, res) => {
  // const bugToSave = {
  //   _id: req.query._id,
  //   severity: +req.query.severity,
  // }
  const loggedInUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedInUser) return res.status(401).send('Cannot Add Bug')
  const bugToSave = req.body

  bugService
    .save(bugToSave, loggedInUser)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot Update bug', err)
      res.status(500).send('Cannot update bugs')
    })
})

//GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params

  const loggedInUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedInUser) return res.status(401).send('Cannot Add Bug')

  let viewedBugs = req.cookies.viewedBugs
    ? JSON.parse(req.cookies.viewedBugs)
    : []

  if (!viewedBugs.includes(bugId)) {
    viewedBugs.push(bugId)
  }
  loggerService.info('visited bugs', bugId)

  if (viewedBugs.length > 3) {
    return res.status(401).send('Wait for a bit')
  }
  res.cookie('viewedBugs', JSON.stringify(viewedBugs), { maxAge: 1000 * 7 })

  bugService
    .getById(bugId, loggedInUser)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot get bug', err)
      res.status(500).send('Cannot load bugs')
    })
})

app.delete('/api/bug/:bugId', (req, res) => {
  const loggedInUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedInUser) return res.status(401).send('Cannot Add Bug')

  const { bugId } = req.params

  bugService
    .remove(bugId, loggedInUser)
    .then(() => res.send('bug removed'))
    .catch(err => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot load bugs')
    })
})

//USER API

app.get('/api/user', (req, res) => {
  console.log('hello')

  userService
    .query()
    .then(users => res.send(users))
    .catch(err => {
      loggerService.error('Cannot find users', err)
      res.status(500).send('Cannot find users')
    })
})

app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  userService
    .getById(userId)
    .then(user => res.send(user))
    .catch(err => {
      loggerService.error('Cannot find user', err)
      res.status(500).send('Cannot find user')
    })
})

//AUTH  API

app.post('/api/auth/login', (req, res) => {
  const credentials = req.body

  authService
    .checkLogin(credentials)
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    })
    .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body
  userService
    .add(credentials)
    .then(user => {
      if (user) {
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
      } else {
        res.status(400).send('cannot signup')
      }
    })
    .catch(() => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => loggerService.info(`Server ready at port ${port}`))

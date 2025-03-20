import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bugService.js'

const app = express()

app.get('/', (req, res) => res.send('Hello there'))
app.get('/api/sasha', (req, res) => res.send('sashaaaa'))

// LIST
app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then(bugs => res.send(bugs))
    .catch(err => {
      //   loggerService.error('Cannot get bugs', err)
      console.log('err:', err)
      res.status(500).send('Cannot load bugs')
    })
})

// CREATE OR EDIT

app.get('/api/bug/save', (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    severity:+req.query.severity,
  }

  bugService
    .save(bugToSave)
    .then(bug => res.send(bug))
    .catch(err => {
        //   loggerService.error('Cannot get bugs', err)
        console.log('err:', err)
        res.status(500).send('Cannot load bugs')
      })
})

//GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
    const {bugId} = req.params

    bugService
      .getById(bugId)
      .then(bug => res.send(bug))
      .catch(err => {
        //   loggerService.error('Cannot get bugs', err)
        console.log('err:', err)
        res.status(500).send('Cannot load bugs')
      })
  })

  app.get('/api/bug/:bugId/remove', (req, res) => {
    const {bugId} = req.params

    bugService
      .remove(bugId)
      .then(() => res.send('bug removed'))
      .catch(err => {
        //   loggerService.error('Cannot get bugs', err)
        console.log('err:', err)
        res.status(500).send('Cannot load bugs')
      })
  })




const port = 3030
app.listen(port, () => console.log(`Server ready at port ${port}`))

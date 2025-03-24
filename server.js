import express from 'express'
import cookieParser from 'cookie-parser'

 

import { bugService } from './services/bugService.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())

// LIST
app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then(bugs => res.send(bugs))
    .catch(err => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

app.get('/api/bug/download',(req,res)=>{
  bugService.generatePdf(res)
  // res.send('downloaded')
  
})

// CREATE OR EDIT

app.get('/api/bug/save', (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    severity: +req.query.severity,
  }

  bugService
    .save(bugToSave)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot save bug', err)
      res.status(500).send('Cannot load bugs')
    })
})

//GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params

  let viewedBugs = req.cookies.viewedBugs
    ? JSON.parse(req.cookies.viewedBugs)
    : []

  if (!viewedBugs.includes(bugId)) {
    viewedBugs.push(bugId)
  }
  console.log('viewedBugs:', viewedBugs)
  loggerService.info('visited bugs', bugId)

  if (viewedBugs.length > 3) {
    return res.status(401).send('Wait for a bit')
  }
  res.cookie('viewedBugs', JSON.stringify(viewedBugs), { maxAge: 1000 * 7 })

  bugService
    .getById(bugId)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot get bug', err)
      res.status(500).send('Cannot load bugs')
    })
})

// app.get('/cookies', (req, res) => {
//   let viewedBugs = req.cookies.viewedBugs || 0
//   viewedBugs++
//   res.cookie('viewedBugs', viewedBugs, { maxAge: 5 * 1000 })

//   res.send('Hello Cookie')
// })

app.get('/api/bug/:bugId/remove', (req, res) => {
  const { bugId } = req.params

  bugService
    .remove(bugId)
    .then(() => res.send('bug removed'))
    .catch(err => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot load bugs')
    })
})

const port = 3030
app.listen(port, () => loggerService.info(`Server ready at port ${port}`))

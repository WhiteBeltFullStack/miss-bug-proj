import { utilService } from './util.service.js'
import fs from 'fs'
import PDFDocument from 'pdfkit-table'

export const bugService = {
  query,
  save,
  getById,
  remove,
  generatePdf,
}

const bugs = utilService.readJsonFile('data/bugs.json')
const PAGE_SIZE = 3

function query(filterBy={}) {
  return Promise.resolve(bugs).then(bugs => {
    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, 'i')
      bugs = bugs.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
      bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.sortBy) {
      const dir = +filterBy.sortDir === 1 ? -1 : 1

      bugs.sort((bugA, bugB) => {
        if (filterBy.sortBy === 'title') {
          return bugA.title.localeCompare(bugB.title) * dir
        } else if (filterBy.sortBy === 'severity') {
          return (bugA.severity - bugB.severity) * dir
        }
        return 0
      })
    }

    const totalCount = bugs.length
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    if (filterBy.pageIdx !== undefined && !isNaN(filterBy.pageIdx)) {
      const startIdx = filterBy.pageIdx * PAGE_SIZE
      bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return { bugs, totalCount, totalPages }
  })
}

function save(bugToSave, loggedInUser) {
  if (bugToSave._id) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
    if (!loggedInUser.isAdmin && bugs[bugIdx].owner._id !== loggedInUser._id) {
      return Promise.reject('Im not your bug')
    }
    // bugs[bugIdx] = { ...bugs[bugIdx], severity: bugToSave.severity }
    bugs[bugIdx] = { ...bugs[bugIdx], ...bugToSave }

    //option 2 Dirrectly change nessery field
    // bugs[bugIdx].severity = bugToSave.severity
  } else {
    delete loggedInUser.username
    bugToSave._id = utilService.makeId()
    bugToSave.owner = loggedInUser
    bugs.unshift(bugToSave)
  }

  return _saveBugsToFile().then(() => bugToSave)
}

function getById(bugId) {
  const bug = bugs.find(bug => bug._id === bugId)
  if (!bug) return Promise.reject('cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId, loggedInUser) {
  const bugIdx = bugs.findIndex(bug => bug._id === bugId)
  if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
  if (!loggedInUser.isAdmin && bugs[bugIdx].owner._id !== loggedInUser._id) {
    return Promise.reject('Im not your bug')
  }
  bugs.splice(bugIdx, 1)
  return _saveBugsToFile()
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 4)
    fs.writeFile('data/bugs.json', data, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function generatePdf(res) {
  query().then(({bugs}) => {
    let doc = new PDFDocument({ margin: 30, size: 'A4' })

    // res.setHeader('Content-Disposition', 'inline; filename="bugs.pdf"')
    res.setHeader('Content-Disposition', 'attachment; filename="bugs.pdf"')
    res.setHeader('Content-Type', 'application/pdf')

    doc.pipe(res)

    createPdf(doc, bugs).then(() => doc.end())
  })
}

function createPdf(doc, bugs) {
  const table = {
    title: 'Bug Report',
    headers: ['Title', 'Severity', 'Description'],
    rows: bugs.map(bug => [bug.title, bug.severity, bug.description]),
  }

  return doc.table(table, { columnsSize: [200, 100, 200] })
}

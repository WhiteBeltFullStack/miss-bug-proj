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

function query() {
  console.log('Enter Query')

  return Promise.resolve(bugs)
}

function save(bugToSave) {
  if (bugToSave._id) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
    console.log('bugIdx:', bugIdx)
    bugs[bugIdx] = { ...bugs[bugIdx], severity: bugToSave.severity }
  } else {
    bugToSave._id = utilService.makeId()
    bugs.unshift(bugToSave)
  }

  return _saveBugsToFile().then(() => bugToSave)
}

function getById(bugId) {
  const bug = bugs.find(bug => bug._id === bugId)
  if (!bug) return Promise.reject('cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId) {
  const bugIdx = bugs.findIndex(bug => bug._id === bugId)
  if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
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
  query().then(bugs => {
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

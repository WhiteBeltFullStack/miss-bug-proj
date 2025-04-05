import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
}

function query(filterBy) {
  // return storageService.query(STORAGE_KEY)
  return axios
    .get(BASE_URL, { params: filterBy })
    .then(res => res.data)
    .then(bugs => {
      // if (filterBy.txt) {
      //   const regExp = new RegExp(filterBy.txt, 'i')
      //   bugs = bugs.filter(bug => regExp.test(bug.title))
      // }

      // if (filterBy.minSeverity) {
      //   bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
      // }
      return bugs
    })
}

function getById(bugId) {
  return axios
    .get(BASE_URL + bugId)
    .then(res => res.data)
    .then(bug => bug)
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
  //will be sent in a body of request
  const url = BASE_URL
  // let queryParams = `?severity=${bug.severity}`
  console.log('bug:', bug)
  if (bug._id) {
    // queryParams += `&_id=${bug._id}`
    return axios
      .put(url + bug._id, bug) //The second parameter is what sent in the body of req
      .then(res => ({ ...bug, ...res.data }))
      .catch(err => {
        console.log('err:', err)
        throw err
      })
  } else {
    return axios
      .post(url, bug) //The second parameter is what sent in the body of req
      .then(res => ({ ...bug, ...res.data }))
      .catch(err => {
        console.log('err:', err)
        throw err
      })
  }
}

function _createBugs() {
  let bugs = utilService.loadFromStorage(STORAGE_KEY)
  if (bugs && bugs.length > 0) return

  bugs = [
    {
      title: 'Infinite Loop Detected',
      severity: 4,
      _id: '1NF1N1T3',
    },
    {
      title: 'Keyboard Not Found',
      severity: 3,
      _id: 'K3YB0RD',
    },
    {
      title: '404 Coffee Not Found',
      severity: 2,
      _id: 'C0FF33',
    },
    {
      title: 'Unexpected Response',
      severity: 1,
      _id: 'G0053',
    },
  ]
  utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
  return {
    txt: '',
    minSeverity: 0,
    pageIdx: undefined,
    sortBy: 'severity',
    sortDir: 1,
  }
}

const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

  useEffect(loadBugs, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then(setBugs)
      .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug removed')
      })
      .catch(err => showErrorMsg(`Cannot remove bug`, err))
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?', 'Bug ' + Date.now()),
      severity: +prompt('Bug severity?', 3),
    }

    bugService
      .save(bug)
      .then(savedBug => {
        setBugs([...bugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch(err => showErrorMsg(`Cannot add bug`, err))
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?', bug.severity)
    const bugToSave = { ...bug, severity }

    bugService
      .save(bugToSave)
      .then(savedBug => {
        const bugsToUpdate = bugs.map(currBug =>
          currBug._id === savedBug._id ? savedBug : currBug
        )

        setBugs(bugsToUpdate)
        showSuccessMsg('Bug updated')
      })
      .catch(err => showErrorMsg('Cannot update bug', err))
  }

  function onSetFilterBy(filterBy) {
    setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
  }

  function onSetPage(diff){
    setFilterBy(prevFilter =>({...prevFilter,pageIdx: prevFilter.pageIdx + diff}))
  }
if(!bugs) return 'loading bugs'
  return (
    <section className="bug-index main-content">
      <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
      <header>
        <h3>Bug List</h3>
        <section>
          <button onClick={onAddBug}>Add Bug</button>
          <button>
            <a href="/api/bug/download">DownLoad</a>{' '}
            {/*<a href="/api/bug/download" target="_blank">DownLoad</a> */}
          </button>
        </section>
      </header>

      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />

      <section>
        <button disabled={filterBy.pageIdx===0} onClick={()=>{onSetPage(-1)}}>Prev</button>
        <span>{filterBy.pageIdx + 1}</span>
        <button disabled={filterBy.pageIdx >= Math.ceil(bugs.length)} onClick={()=>{onSetPage(1)}}>Next</button>
      </section>
    </section>
  )
}

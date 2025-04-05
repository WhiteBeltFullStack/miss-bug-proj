const { useState, useEffect } = React
const { useNavigate, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { showSuccessMsg } from '../services/event-bus.service.js'

export function BugEdit() {
  const [bugToEdit, setBugToEdit] = useState(bugService.getEmptyBug())
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    if (params.bugId) loadBug()
  }, [params.bugId])

  console.log('bug:', params.bugId)

  function loadBug() {
    bugService
      .getById(params.bugId)
      .then(setBugToEdit)
      .catch(err => showErrorMsg('cannot load bug'))
  }

  function onHandleChange({ target }) {
    const field = target.name
    let value = target.value
    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break

      case 'checkbox':
        value = target.checked
        break

      default:
        break
    }
    setBugToEdit(prevBug => ({ ...prevBug, [field]: value }))
  }
  function onSaveBug(ev) {
    ev.preventDefault()
    if (!bugToEdit.title || !bugToEdit.severity) return
    bugService
      .save(bugToEdit)
      .then(savedBug => {
        showSuccessMsg('Bug Saved!')
      })
      .catch(err => {
        console.log('Cannot save bug', err)
        showErrorMsg('Cannot save bug')
      })
      .finally(() => navigate('/bug'))
  }

  const { title, severity } = bugToEdit

  return (
    <section className="bug-edit">
      <form action="" onSubmit={onSaveBug}>
        <label htmlFor="title"></label>
        <input
          type="text"
          value={title}
          name="title"
          id="title"
          onChange={onHandleChange}
        />

        <label htmlFor="severity"></label>
        <input
          type="number"
          value={severity}
          name="severity"
          id="severity"
          onChange={onHandleChange}
        />

        <button className="btn" type="submit">
          {params.bugId ? 'Update' : 'Add'}
        </button>
      </form>
    </section>
  )
}

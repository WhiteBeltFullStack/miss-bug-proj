const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

  useEffect(() => {
    onSetFilterBy(filterByToEdit)
  }, [filterByToEdit])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break

      case 'checkbox':
        value = target.checked ? 1 : 0
        break

      default:
        break
    }

    setFilterByToEdit(prevFilter => ({
      ...prevFilter,
      [field]: value,
      pageIdx: prevFilter.pageIdx,
    }))
  }

  function onSubmitFilter(ev) {
    ev.preventDefault()
    onSetFilterBy(filterByToEdit)
  }

  const { txt, minSeverity, sortBy, sortDir } = filterByToEdit
  return (
    <section className="bug-filter">
      <h2>Filter</h2>
      <form onSubmit={onSubmitFilter}>
        <label htmlFor="txt">Text: </label>
        <input
          value={txt}
          onChange={handleChange}
          type="text"
          placeholder="By Text"
          id="txt"
          name="txt"
        />

        <label htmlFor="minSeverity">Min Severity: </label>
        <input
          value={minSeverity}
          onChange={handleChange}
          type="number"
          placeholder="By Min Severity"
          id="minSeverity"
          name="minSeverity"
        />

        <label htmlFor="sortBy">Sort By:</label>
        <select
          value={sortBy}
          name="sortBy"
          id="sortBy"
          onChange={handleChange}
        >
          <option value="">None</option>
          <option value="severity">Severity</option>
          <option value="title">Title</option>
        </select>

        <label htmlFor="sortDir">Sort Direction:</label>
        <input
          type="checkbox"
          id="sortDir"
          name="sortDir"
          checked={sortDir === 1}
          onChange={handleChange}
        ></input>
      </form>
    </section>
  )
}

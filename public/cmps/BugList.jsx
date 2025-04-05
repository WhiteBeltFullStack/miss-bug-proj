const { Link } = ReactRouterDOM
import { authService } from '../services/auth.service.js'
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug }) {
  const user = authService.getLoggedInUser()

  function isAllowed(bug) {
    if (!user) return false
    return user.isAdmin || bug.owner._id === user._id
  }

  if (!bugs) return <div>Loading...</div>
  return (
    <ul className="bug-list">
      {bugs.map(bug => (
        <li key={bug._id}>
          <BugPreview bug={bug} />
          <section className="actions">
            <button className="details">
              <Link to={`/bug/${bug._id}`}>Details</Link>
            </button>

            {isAllowed(bug) && (
              <div>
                  {/* <button onClick={() => onEditBug(bug)}>Edit</button> */}
                <Link to={`/bug/edit/${bug._id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => onRemoveBug(bug._id)}>x</button>
              </div>
            )}
          </section>
        </li>
      ))}
    </ul>
  )
}

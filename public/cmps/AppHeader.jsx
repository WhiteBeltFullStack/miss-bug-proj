const { NavLink, Link } = ReactRouterDOM
const { useNavigate } = ReactRouter

import { authService } from '../services/auth.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function AppHeader({ loggedInUser, setLoggedInUser }) {
  const navigate = useNavigate()

  function onLogOut() {
    authService
      .logout()
      .then(() => {
        setLoggedInUser(null)
        navigate('/auth')
      })
      .catch(err => {
        console.log('err:', err)
        showErrorMsg('Couldnt logout')
      })
  }

  return (
    <header className="app-header main-content single-row">
      <h1>Miss Bug</h1>
      <nav className="bugapp-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/bug">Bugs</NavLink>
        <NavLink to="/about">About</NavLink>

        {!loggedInUser ? (
          <NavLink to="/auth">Login</NavLink>
        ) : (
          <div className="user-login">
            <Link to={`/user/${loggedInUser._id}`}>
              {loggedInUser.fullname}
            </Link>
            <button onClick={onLogOut}>Logout</button>
          </div>
        )}
      </nav>
    </header>
  )
}

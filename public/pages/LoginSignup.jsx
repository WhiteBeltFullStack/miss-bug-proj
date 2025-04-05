const { useState } = React
const { useNavigate } = ReactRouter

import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { authService } from '../services/auth.service.js'
import { userService } from '../services/user.service.js'

export function LoginSignup({ setLoggedInUser }) {
  const [isSignup, setIsSignup] = useState(false)
  const [credentials, setCredentials] = useState(
    userService.getEmptyCredentials()
  )

  const navigate = useNavigate()

  function handleChange({ target }) {
    const { name: field, value } = target
    setCredentials(prevCred => ({ ...prevCred, [field]: value }))
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    isSignup ? signup(credentials) : login(credentials)
  }
  function login(credentials) {
    authService
      .login(credentials)
      .then(user => {
        setLoggedInUser(user)
        showSuccessMsg(`Welcome Back ${user.fullname}`)
        navigate('/bug')
      })
      .catch(err => {
        console.log('err:', err)
        showErrorMsg(`Couldn't login...`)
      })
  }

  function signup(credentials) {
    authService
      .signup(credentials)
      .then(user => {
        setLoggedInUser(user)
        showSuccessMsg(`Welcome ${user.fullname}`)
        navigate('/bug')
      })
      .catch(err => {
        console.log('err:', err)
        showErrorMsg(`Couldn't signup...`)
      })
  }

  return (
    <section className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={credentials.username}
          placeholder="User name"
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          type="text"
          name="password"
          value={credentials.password}
          placeholder="Password"
          onChange={handleChange}
          required
          autoFocus
        />
        {isSignup && (
          <input
            type="text"
            name="fullname"
            value={credentials.fullname}
            placeholder="Fullname"
            onChange={handleChange}
            required
            autoFocus
          />
        )}
        <button>{isSignup ? 'Sign-up' : 'Login'}</button>
      </form>
      <div className="btns">
        <a
          href="#"
          onClick={() => {
            setIsSignup(!isSignup)
          }}
        >
          {isSignup ? 'Already a member? Just Login' : 'New user ? Signup here'}
        </a>
      </div>
    </section>
  )
}

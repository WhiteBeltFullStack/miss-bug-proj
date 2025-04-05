const STORAGE_KEY_LOGGEDIN_USER = 'loggedInUser'
const BASE_URL = '/api/auth/'

export const authService = {
  login,
  signup,
  logout,
  getLoggedInUser,
}

function login({ username, password }) {
    
  return axios.post(BASE_URL + 'login', { username, password })

    .then(res => res.data)
    .then(_setLoggedInUser)
}

function signup({ username, password, fullname }) {
  return axios.post(BASE_URL + 'signup', { username, password, fullname })
    .then(res => res.data)
    .then(_setLoggedInUser)
}

function logout() {
  return axios.post(BASE_URL + 'logout').then(() =>
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  )
}

function getLoggedInUser() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function _setLoggedInUser(user) {
  const { _id, fullname, isAdmin } = user
  const userToSave = { _id, fullname, isAdmin }

  sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userToSave))
  return userToSave
}

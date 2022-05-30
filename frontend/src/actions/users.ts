import axios from 'axios'
import { Credentials, ISignupForm } from '../interfaces/user'

export const login = (userData: Credentials) => {
  return axios.post('/api/users/login', userData).then((response) => {
    // localStorage.setItem('user', JSON.stringify(response.data))
    // localStorage.setItem('token', JSON.stringify(response.data.token))
    return response.data
  })
}

export const signup = (userData: ISignupForm) => {
  return axios.post('/api/users', userData).then((response) => response.data)
}

export const getStorageUser = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
}

export const getUsers = () => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios.get('/api/users', config).then((response) => response.data)
}

// export const updateProfile = (profileData: IProfile) => {
//   const token = localStorage.getItem('token')?.replaceAll('"', '')
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   }
//   return axios
//     .put(`/api/users/profile`, {profile: profileData}, config)
//     .then((response) => response.data)
// }

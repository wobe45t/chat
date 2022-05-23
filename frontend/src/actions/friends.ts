import axios from 'axios'

export const getFriends = () => {
  return axios.get('/api/friends').then((response) => response.data)
}

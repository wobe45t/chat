import axios from 'axios'

export const getMessages = (user_id: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .get(`/api/messages/${user_id}`, config)
    .then((response) => response.data)
}

export const addMessage = (user_id: string, text: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .post(`/api/messages/${user_id}`, { text }, config)
    .then((response) => response.data)
}

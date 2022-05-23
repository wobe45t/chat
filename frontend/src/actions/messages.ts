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

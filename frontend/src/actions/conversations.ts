import axios from 'axios'

export const getConversations = () => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .get(`/api/conversations`, config)
    .then((response) => response.data)
}

export const getConversation = (conversation_id: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .get(`/api/conversations/${conversation_id}`, config)
    .then((response) => response.data)
}
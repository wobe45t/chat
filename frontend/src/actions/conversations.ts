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

export const markReadLatestMessage = (
  conversation_id: string,
  message_id: string
) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .put(`/api/conversations/${conversation_id}`, { message_id }, config)
    .then((response) => {
      console.log(response.data)
      return response.data
    })
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

export const addGroupConversation = (userIds: string[]) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .post(`/api/conversations`, { users: userIds }, config)
    .then((response) => response.data)
}

export const leaveConversation = (conversationId: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  return axios
    .put(`/api/conversations/leave/${conversationId}`, {}, config)
    .then((response) => response.data)
}

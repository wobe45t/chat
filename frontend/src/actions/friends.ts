import axios from 'axios'

export const getFriends = () => {
  return axios.get('/api/friends').then((response) => response.data)
}

export const inviteFriend = (userId: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  return axios
    .post(`/api/friends/invite/${userId}`, null, config)
    .then((response) => response.data)
}

export const acceptFriendInvitation = (userId: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  return axios
    .post(`/api/friends/accept/${userId}`, null, config)
    .then((response) => response.data)
}

export const declineFriendInvitation = (userId: string) => {
  const token = localStorage.getItem('token')?.replaceAll('"', '')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  return axios
    .post(`/api/friends/decline/${userId}`, null, config)
    .then((response) => response.data)
}

import { createContext, useContext, useEffect, useState } from 'react'
import { IProfile } from '../interfaces/user'
import { useNavigate } from 'react-router'
import io, { Socket } from 'socket.io-client'
import {IUser} from '../interfaces/user'

export const UserContext = createContext<{
  user: IUser
  setUser: Function
}>({
  user: {
    friends: [],
    friendRequests: []
  },
  setUser: () => {},
})

interface Props {
  children: any
}

export const UserProvider = (props: Props) => {
  const { children } = props
  const [user, setUser] = useState({})
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser)
      setUser(parsedUser)
    } else {
      navigate('/login')
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

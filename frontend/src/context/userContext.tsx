import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
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

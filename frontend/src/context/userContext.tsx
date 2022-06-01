import { createContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { IUser } from '../interfaces/user'

export const UserContext = createContext<{
  user: IUser | null
  setUser: Function
  userRef: any
}>({
  user: {
    friends: [],
    friendRequests: [],
  },
  setUser: () => {},
  userRef: null,
})

interface Props {
  children: any
}

export const UserProvider = (props: Props) => {
  const { children } = props
  const [user, setUser] = useState<IUser | null>(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(true)
  const userRef = useRef<IUser | null>(null)

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

  useEffect(() => {
    userRef.current = user
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <UserContext.Provider value={{ user, setUser, userRef }}>
      {children}
    </UserContext.Provider>
  )
}

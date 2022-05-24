import { createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from './userContext'
import { ChatContext } from './chatContext'
import io, { Socket } from 'socket.io-client'
import { IUser } from '../interfaces/user'
import { isConstructorDeclaration } from 'typescript'

export const SocketContext = createContext<{
  socket: Socket | null
  setSocket: Function
  initSocket: Function
  reset: Function
}>({
  socket: null,
  setSocket: Function,
  initSocket: Function,
  reset: Function,
})

interface Props {
  children: any
}

export const SocketProvider = (props: Props) => {
  const { children } = props
  const [socket, setSocket] = useState<Socket | null>(null)
  const [socketInitialized, setSocketInitialized] = useState<boolean>(false)
  const { chatUser, setChatUser, setUsers, appendMessage } =
    useContext(ChatContext)
  const { user, setUser } = useContext(UserContext)

  const reset = () => {
    socket?.close()
    setSocket(null)
    setSocketInitialized(false)
  }

  const initSocket = (token: string) => {
    if (socketInitialized || socket) return

    const newSocket = io(`http://localhost:5000/ws`, {
      query: { token },
    })
    setSocketInitialized(true)
    setSocket(newSocket)

    newSocket.off('user').on('user', (data: any) => {
      console.log('user: ', data)
    })

    newSocket.off('message').on('message', (data: any) => {
      console.log('messages: ', data)
      appendMessage(data.from, data)
    })

    newSocket.off('friend-connect').on('friend-connect', (data: any) => {
      setChatUser((prev: any) => {
        if (prev === null) return prev
        if (prev._id === data._id) {
          return { ...prev, active: true }
        }
        return prev
      })

      const friends = user.friends?.map((user: any) => {
        if (user._id === data._id) {
          return { ...user, active: true }
        }
        return user
      })
      setUser((prev: IUser) => ({ ...prev, friends: friends }))
    })
    newSocket.off('friend-disconnect').on('friend-disconnect', (data: any) => {
      setChatUser((prev: any) => {
        if (prev === null) return prev
        if (prev._id === data._id) {
          return { ...prev, active: false }
        }
        return prev
      })
      const friends = user.friends?.map((user: any) => {
        if (user._id === data._id) {
          return { ...user, active: false }
        }
        return user
      })
      setUser((prev: IUser) => ({ ...prev, friends: friends }))
    })

    newSocket.off('active-friends').on('active-friends', (data: any[]) => {
      console.log('active-friends: ', data)
      console.log('user before: ', user)
      console.log('friends before: ', user.friends)
      const friends = user.friends?.map((user: any) => ({
        ...user,
        active: data.includes(user._id),
      }))
      setUser((prev: IUser) => ({ ...prev, friends: friends }))
      console.log('friends set to :', friends)
    })

    newSocket.off('friend-request').on('friend-request', (data: any) => {
      console.log('friend-request: ', data)
      setUser((prev: IUser) => ({ ...prev, ...data.user }))
    })
  }

  useEffect(() => {
    //? Without it chat active status wont refresh ?
    console.log('chatUser changed: ', chatUser)
  }, [chatUser])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      initSocket(token.replaceAll('"', ''))
    }

    return () => {
      console.log('closing socket')
      setSocketInitialized(false)
      socket?.close()
    }
  }, [])

  useEffect(() => {
    if (socket?.connected) {
      console.log('socket connected: ', socket.connected)
      socket?.emit('login', true)
    }
  }, [socket?.connected])

  return (
    <SocketContext.Provider value={{ socket, setSocket, initSocket, reset }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const { socket } = useContext(SocketContext)
  return socket
}

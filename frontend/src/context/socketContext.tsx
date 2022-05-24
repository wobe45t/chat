import { createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from './userContext'
import { ChatContext } from './chatContext'
import io, { Socket } from 'socket.io-client'
import { IUser } from '../interfaces/user'

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
  const { chat, setChat, setUsers, appendMessage } = useContext(ChatContext)
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

    newSocket.off('users').on('users', (data: any[]) => {
      setUsers(data.filter((u: any) => u.email !== user.email))

      // console.log(
      //   `userEmail: ${user.email}\nuserId: ${user.id}\nchat-userId:${chat.user?.id}`
      // )
      data.forEach((user: any) => {
        if (user.id === chat.user?.id) {
          setChat((prev: any) => ({ ...prev, chatId: user.chatId }))
        }
      })

    })

    newSocket.off('user').on('user', (data: any) => {
      console.log('user: ', data)
    })

    newSocket.off('message').on('message', (data: any) => {
      console.log('messages: ', data)
      appendMessage(data.from, data)
    })

    newSocket.off('friend-request').on('friend-request', (data: any) => {
      console.log('friend-request: ', data)
      // if (user.friendRequests?.includes(data.from)) return //TODO replace it with backend DB check
      // setUser((prev: IUser) => ({
      //   ...prev,
      //   friendRequests: [...(prev.friendRequests ?? []), data.from],
      // }))
    })

    newSocket.off('connected').on('connected', (data: any) => {
      console.log('connected : ', data)
      setUser((prev: any) => ({ ...prev, chatId: data.chatId }))
    })

    console.log('socket set')
  }

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

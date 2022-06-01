import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import { UserContext } from './userContext'
import { ChatContext } from './chatContext'
import io, { Socket } from 'socket.io-client'
import { IUser } from '../interfaces/user'
import { useQueryClient } from 'react-query'
import { IConversation, Message } from '../interfaces/conversation'
import { markReadLatestMessage } from '../actions/conversations'
import { ChatUser } from '../interfaces/conversation'

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
  const {
    activeUsers,
    conversation,
    conversationRef,
    setConversation,
    setConversations,
    appendMessage,
    conversationUserUpdate,
  } = useContext(ChatContext)
  const { user, setUser, userRef } = useContext(UserContext)
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

    newSocket
      .off('message')
      .on(
        'message',
        (data: {
          conversationId: string
          message: Message
          chatUser: ChatUser
        }) => {
          setConversation((prev: any) => {
            if (data.conversationId === prev?._id) {
              markReadLatestMessage(data.conversationId, data.message._id)
              const prevMessages =
                prev?.messages?.length !== 0 ? prev.messages : []
              return {
                ...prev,
                messages: prevMessages.concat(data.message),
                latest: data.message,
                users: prev.users.map((chatUser: ChatUser) => {
                  if (chatUser.user._id === data.chatUser.user?._id) {
                    return data.chatUser
                  }
                  return chatUser
                }),
              }
            }
            return prev
          })
          setConversations((prev: IConversation[]) => {
            return prev.map((conversation: IConversation) => {
              if (conversation._id === data.conversationId) {
                const newUsers = conversation.users.map(
                  (chatUser: ChatUser) => {
                    if (
                      chatUser.user._id === userRef?.current._id &&
                      conversationRef?.current?._id === conversation._id
                    ) {
                      return {
                        ...chatUser,
                        lastRead: data.message._id,
                      }
                    }
                    if (chatUser.user._id === data.chatUser.user?._id) {
                      return data.chatUser
                    }
                    return chatUser
                  }
                )
                return {
                  ...conversation,
                  latest: data.message,
                  users: newUsers,
                }
              }
              return conversation
            })
          })
        }
      )

    newSocket.off('friend-connect').on('friend-connect', (data: any) => {
      activeUsers.add(data._id)
      // setConversation((prev: any) => {
      //   if (prev === null) return prev
      //   if (prev._id === data._id) {
      //     return { ...prev, active: true }
      //   }
      //   return prev
      // })
      // const friends = user.friends?.map((user: any) => {
      //   if (user._id === data._id) {
      //     return { ...user, active: true }
      //   }
      //   return user
      // })
      // setUser((prev: IUser) => ({ ...prev, friends: friends }))
    })
    newSocket.off('friend-disconnect').on('friend-disconnect', (data: any) => {
      activeUsers.delete(data._id)
      // setConversation((prev: any) => {
      //   if (prev === null) return prev
      //   if (prev._id === data._id) {
      //     return { ...prev, active: false }
      //   }
      //   return prev
      // })
      // const friends = user.friends?.map((user: any) => {
      //   if (user._id === data._id) {
      //     return { ...user, active: false }
      //   }
      //   return user
      // })
      // setUser((prev: IUser) => ({ ...prev, friends: friends }))
    })

    newSocket.off('active-friends').on('active-friends', (data: any[]) => {
      // This cant work - user is bound
      data.forEach((user: string) => activeUsers.add(user))
      // const friends = user?.friends?.map((user: any) => ({
      //   ...user,
      //   active: data.includes(user._id),
      // }))
      // setUser((prev: IUser) => ({ ...prev, friends: friends }))
    })

    newSocket.off('friend-request').on('friend-request', (data: any) => {
      console.log('friend request')
      setUser((prev: IUser) => ({ ...prev, ...data.user }))
    })

    newSocket
      .off('conversation-user-update')
      .on(
        'conversation-user-update',
        (data: { conversation_id: string; user: IUser }) => {
          console.warn('conversation users update received : ', data)
          conversationUserUpdate(data)
        }
      )

    newSocket
      .off('conversation-user-remove')
      .on(
        'conversation-user-remove',
        (data: { conversationId: string; userId: string }) => {
          console.warn('conversation users delete received : ', data)
          setConversations((prev: IConversation[]) =>
            prev.map((conv: IConversation) => {
              if (conv._id === data.conversationId) {
                return {
                  ...conv,
                  users: conv.users.filter(
                    (chatUser: ChatUser) => chatUser.user._id !== data.userId
                  ),
                }
              }
              return conv
            })
          )

          setConversation((prev: IConversation) => {
            if (prev === null) return null
            if (prev._id === data.conversationId) {
              return {
                ...prev,
                users: prev.users.filter(
                  (chatUser: ChatUser) => chatUser.user._id !== data.userId
                ),
              }
            }
            return prev
          })
        }
      )

    newSocket
      .off('conversation-added')
      .on('conversation-added', (data: { conversation: IConversation }) => {
        console.log('conversation-added: ', data)
        setConversations((prev: IConversation[]) => {
          const newConversations = prev ?? []
          return newConversations.concat(data.conversation)
        })
      })
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

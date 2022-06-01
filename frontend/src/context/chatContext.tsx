import { createContext, useEffect, useState, useRef } from 'react'
import { IConversation, Message } from '../interfaces/conversation'
import { ChatUser } from '../interfaces/conversation'

interface IContext {
  conversation: IConversation | null
  conversationRef: any
  setConversation: Function
  conversations: IConversation[] | null
  setConversations: Function
  users: any[]
  setUsers: Function
  addMessages: Function
  appendMessage: Function
  conversationUserUpdate: Function
  messages: { [key: string]: any[] }
  reset: Function
}

export const ChatContext = createContext<IContext>({
  conversation: null,
  conversationRef: null,
  setConversation: Function,
  conversations: null,
  setConversations: Function,
  users: [],
  setUsers: Function,
  addMessages: Function,
  appendMessage: Function,
  conversationUserUpdate: Function,
  messages: {},
  reset: Function,
})

interface Props {
  children: any
}

export const ChatProvider = (props: Props) => {
  const { children } = props
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [conversations, setConversations] = useState<IConversation[] | null>(
    null
  )
  const [users, setUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({})

  const conversationRef = useRef<IConversation | null>(conversation)

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  const reset = () => {
    setConversation(null)
    setConversations(null)
    setUsers([])
    setMessages({})
  }

  const addMessages = (userId: string, messages: any[]) => {
    setMessages((prev: any) => ({ ...prev, [userId]: messages }))
    console.table(messages)
  }

  const appendMessage = (data: {
    conversationId: string
    message: Message
  }) => {}

  const conversationUserUpdate = (data: {
    conversation_id: string
    chatUser: ChatUser
  }) => {
    setConversations((prev: IConversation[] | null) => {
      if (prev === null) return null
      return prev.map((conversation: IConversation) => {
        if (data.conversation_id === conversation._id) {
          return {
            ...conversation,
            users: conversation.users.map((chatUser: ChatUser) => {
              if (chatUser.user._id === data.chatUser.user?._id) {
                return data.chatUser
              }
              return chatUser
            }),
          }
        }
        return conversation
      })
    })
    setConversation((prev: IConversation | null) => {
      if (prev === null) return null

      if (prev._id === data.conversation_id) {
        return {
          ...prev,
          users: prev.users.map((chatUser: ChatUser) => {
            if (chatUser.user._id === data.chatUser.user._id) {
              return data.chatUser
            }
            return chatUser
          }),
        }
      }
      return prev
    })
  }

  useEffect(() => {
    console.log('conversation: ', conversation)
  }, [conversation])

  return (
    <ChatContext.Provider
      value={{
        conversation,
        conversationRef,
        setConversation,
        conversations,
        setConversations,
        users,
        setUsers,
        addMessages,
        appendMessage,
        conversationUserUpdate,
        messages,
        reset,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

import { createContext, useState } from 'react'
import { useQueryClient } from 'react-query'
import { IConversation, Message } from '../interfaces/conversation'

interface IContext {
  conversation: IConversation | null
  setConversation: Function
  conversations: IConversation[] | null
  setConversations: Function
  users: any[]
  setUsers: Function
  addMessages: Function
  appendMessage: Function
  messages: { [key: string]: any[] }
  reset: Function
}

export const ChatContext = createContext<IContext>({
  conversation: null,
  setConversation: Function,
  conversations: null,
  setConversations: Function,
  users: [],
  setUsers: Function,
  addMessages: Function,
  appendMessage: Function,
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
  }) => {
    setConversation((prev: any) => {
      if (data.conversationId === prev?._id) {
        const prevMessages = prev?.messages?.length !== 0 ? prev.messages : []
        prevMessages.push(data.message)
        return { ...prev, messages: prevMessages}
      }
      return prev
    })
  }

  return (
    <ChatContext.Provider
      value={{
        conversation,
        setConversation,
        conversations,
        setConversations,
        users,
        setUsers,
        addMessages,
        appendMessage,
        messages,
        reset,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

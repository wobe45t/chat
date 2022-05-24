import { createContext, useState } from 'react'

interface IChat {
  _id: string
  firstName: string
  lastName: string
  active: boolean
}
interface IContext {
  chatUser: IChat | null
  setChatUser: Function
  users: any[]
  setUsers: Function
  addMessages: Function
  appendMessage: Function
  messages: { [key: string]: any[] }
  reset: Function
}

export const ChatContext = createContext<IContext>({
  chatUser: null,
  setChatUser: Function,
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
  const [chatUser, setChatUser] = useState<IChat | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({})

  const reset = () => {
    setChatUser(null)
    setUsers([])
    setMessages({})
  }

  const addMessages = (userId: string, messages: any[]) => {
    setMessages((prev: any) => ({ ...prev, [userId]: messages }))
    console.table(messages)
  }

  const appendMessage = (userId: string, message: any) => {
    setMessages((prev: any) => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), message],
    }))
    console.table(messages)
  }

  return (
    <ChatContext.Provider
      value={{
        chatUser,
        setChatUser,
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

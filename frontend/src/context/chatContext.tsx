import { createContext, useState } from 'react'

interface IChat {
  user: { id: string; firstName: string; lastName: string } | null
  chatId: string
}
interface IContext {
  chat: IChat
  setChat: Function
  users: any[]
  setUsers: Function
  addMessages: Function
  appendMessage: Function
  messages: { [key: string]: any[] }
  reset: Function
}

export const ChatContext = createContext<IContext>({
  chat: {
    user: null,
    chatId: '',
  },
  setChat: Function,
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
  const [chat, setChat] = useState<IChat>({ chatId: '', user: null })
  const [users, setUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<{ [key: string]: any[] }>({})

  const reset = () => {
    setChat({ chatId: '', user: null })
    setUsers([])
    setMessages({})
  }

  const addMessages = (userId: string, messages: any[]) => {
    //TODO set messages for each user
    setMessages((prev: any) => ({ ...prev, [userId]: messages }))
    console.log(`userId: ${userId}`)
    console.table(messages)
  }

  const appendMessage = (userId: string, message: any) => {
    setMessages((prev: any) => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), message],
    }))
    console.log(`userId: ${userId}`)
    console.table(messages)
  }

  return (
    <ChatContext.Provider
      value={{
        chat,
        setChat,
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

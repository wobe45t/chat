import {ChatUser} from './user'

export type Message = {
  _id: string
  text: string
  user: ChatUser
  createdAt: Date
}
export interface IConversation {
  _id: string
  messages?: Message[]
  latest: Message
  users: ChatUser[]
  name?: string
}
import {IUser } from './user'

export type Message = {
  _id: string
  text: string
  user: IUser
  createdAt: Date
}

export type ChatUser = {
  _id?: string
  lastRead: string
  user: {
    _id: string
    firstName: string
    lastName: string
  }
}
export interface IConversation {
  _id: string
  messages?: Message[]
  latest: Message
  users: ChatUser[]
  name?: string
}

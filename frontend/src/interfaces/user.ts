export interface Credentials {
  email: string
  password: string
}

export interface IUser {
  _id?: string
  email?: string
  firstName?: string
  lastName?: string
  chatId?: string
  friends?: any[]
  friendRequests?: any[]
}

export interface ISignupForm extends Credentials {
  firstName: string
  lastName: string
}

export type ChatUser = {
  _id?: string
  firstName: string
  lastName: string
}
export interface IProfile {
  name: string
  lastName: string
}
export interface Credentials {
  email: string
  password: string
}

export interface IUser {
  _id?: string
  email?: string
  profile?: IProfile
  chatId?: string
  friends?: any[]
  friendRequests?: any[]
}
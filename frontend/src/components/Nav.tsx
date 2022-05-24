import { useState, useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { getFriends } from '../actions/friends'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  FilterIcon,
  LogoutIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/outline'
import { SearchInput } from './SearchInput'
import { UserContext } from '../context/userContext'
import { ChatContext } from '../context/chatContext'
import { useSocket } from '../context/socketContext'
import { useNavigate } from 'react-router'
import { getMessages } from '../actions/messages'
import { useMutation } from 'react-query'
import { SocketContext } from '../context/socketContext'

const NavItem = (props: { onClick: Function; label: string; icon: any }) => {}

const Nav = () => {
  // const { data: friends } = useQuery('friends', getFriends)
  const socket = useSocket()
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const { reset: resetSocket } = useContext(SocketContext)

  const {
    users,
    chatUser,
    setChatUser,
    addMessages,
    reset: resetChat,
  } = useContext(ChatContext)
  const [search, setSearch] = useState('')
  const [friendsView, setFriendsView] = useState<boolean>(false)

  const { mutate: getMessagesMutate } = useMutation(
    (userId: string) => getMessages(userId),
    {
      onSuccess: (data: any[], userId: string) => {
        addMessages(userId, data)
      },
    }
  )

  return (
    <div className='p-2 flex flex-col h-full gap-2 bg-gray-50'>
      <div className='text-xl font-light tracking-tight'>
        <div>
          {user.firstName} {user.lastName}
        </div>
      </div>
      <div
        onClick={() => navigate('/notifications')}
        className='border flex flex-row items-center gap-2 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-700 hover:text-white'
      >
        <BellIcon className='w-5 h-5' />
        <div className='w-full flex flex-row justify-between'>
          <div>Requests</div>
          {user.friendRequests?.length !== 0 && (
            <div className='text-green-700'>{user.friendRequests?.length}</div>
          )}
        </div>
      </div>
      <div
        onClick={() => navigate('/profile')}
        className='border flex flex-row items-center gap-2 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-700 hover:text-white'
      >
        <UserIcon className='w-5 h-5' />
        <span>Profile</span>
      </div>
      <div
        onClick={() => {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          resetSocket()
          resetChat()
          navigate('/login')
        }}
        className='border flex flex-row items-center gap-2 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-700 hover:text-white'
      >
        <LogoutIcon className='w-5 h-5' />
        <span>Logout</span>
      </div>
      <div>
        <SearchInput
          label='Search users'
          name='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className='flex flex-row justify-evenly border rounded-md'>
        <div
          onClick={() => setFriendsView(false)}
          className={`w-full text-center cursor-pointer hover:bg-gray-200 ${
            !friendsView && 'bg-slate-200'
          }`}
        >
          All
        </div>
        <div
          onClick={() => setFriendsView(true)}
          className={`w-full text-center cursor-pointer hover:bg-gray-200 ${
            friendsView && 'bg-slate-200'
          }`}
        >
          Friends
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {!friendsView ? (
          users.length === 0 ? (
            <div>No users found</div>
          ) : (
            users.map((user: any, index: number) => (
              <div
                key={index}
                className='flex flex-row items-center gap-3 font-light text-lg tracking-tighter'
                onClick={() => {
                  console.log(`select user:${JSON.stringify(user)}`)
                  getMessagesMutate(user._id)
                  setChatUser(user)
                }}
              >
                <div className='flex flex-row items-center justify-around gap-1'>
                  {/* <div className='bg-green-500 rounded-full w-3 h-3' /> */}
                  <div className='ml-1 flex flex-col'>
                    <div>
                      {user.firstName} {user.lastName}
                    </div>
                    <div className='text-xs tracking-tight font-light text-gray-500'>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <div>
            {user.friends?.map((user: any, index: any) => (
              <div
                key={index}
                className='flex flex-row items-center gap-3 font-light text-lg tracking-tighter'
                onClick={() => {
                  console.log(`select user:${JSON.stringify(user)}`)
                  getMessagesMutate(user._id)
                  setChatUser(user)
                }}
              >
                <div className='flex flex-row items-center justify-around gap-1'>
                  <div
                    className={`${
                      user.active ? 'bg-green-500' : 'bg-red-500'
                    } rounded-full w-3 h-3`}
                  />
                  <div className='ml-1 flex flex-col'>
                    <div>
                      {user.firstName} {user.lastName}
                    </div>
                    <div className='text-xs tracking-tight font-light text-gray-500'>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default Nav

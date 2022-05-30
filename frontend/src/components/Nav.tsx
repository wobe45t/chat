import { useState, useContext, useEffect, memo } from 'react'
import {
  LogoutIcon,
  PlusIcon,
  UserIcon,
  BellIcon,
  XIcon,
} from '@heroicons/react/outline'
import { SearchInput } from './SearchInput'
import { UserContext } from '../context/userContext'
import { ChatContext } from '../context/chatContext'
import { useSocket } from '../context/socketContext'
import { useNavigate } from 'react-router'
import { getMessages } from '../actions/messages'
import { useMutation, useQuery } from 'react-query'
import { SocketContext } from '../context/socketContext'
import { getUsers } from '../actions/users'
import { MyModal } from './Modal'
import { getConversations } from '../actions/conversations'
import { IConversation } from '../interfaces/conversation'
import { ChatUser } from '../interfaces/user'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

enum View {
  CHATS,
  ALL,
}

const Nav = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  const { reset: resetSocket } = useContext(SocketContext)

  const {
    setConversation,
    addMessages,
    reset: resetChat,
    conversations,
    setConversations,
  } = useContext(ChatContext)

  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>(View.CHATS)
  const [showModal, setShowModal] = useState<boolean>(false)

  const { mutate: getMessagesMutate } = useMutation(
    (userId: string) => getMessages(userId),
    {
      onSuccess: (data: any[], userId: string) => {
        addMessages(userId, data)
      },
    }
  )
  const [users, setUsers] = useState([])

  useEffect(() => {
    getConversations().then((data) => {
      console.log('conversations: ', data)
      setConversations(data)
    })
  }, [])

  useEffect(() => {
    if (view === View.ALL) {
      getUsers().then((data) => {
        console.log('users: ', data)
        setUsers(data)
      })
    }
  }, [view])

  const [newConversationUsers, setNewConversationUsers] = useState<any[]>([])

  const createNewConversation = () => {
    console.log('create new conversation: ', newConversationUsers)
  }

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
      <div className='flex flex-row justify-evenly'>
        <div
          onClick={() => setView(View.CHATS)}
          className={`px-2 py-1 w-full text-center cursor-pointer hover:bg-gray-700 hover:text-white ${
            view === View.CHATS && 'bg-slate-200'
          }`}
        >
          Chats
        </div>
        <div
          onClick={() => setView(View.ALL)}
          className={`px-2 py-1 w-full text-center cursor-pointer hover:bg-gray-700 hover:text-white ${
            view === View.ALL && 'bg-slate-200'
          }`}
        >
          All
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {view === View.ALL ? (
          users.length === 0 ? (
            <div>No users found</div>
          ) : (
            users
              .filter((u: any) => u._id !== user._id)
              .map((user: any, index: number) => (
                <div
                  key={index}
                  className='flex flex-row items-center gap-3 font-light text-lg tracking-tighter'
                  onClick={() => {
                    console.log(`select user:${JSON.stringify(user)}`)
                    // getMessagesMutate(user._id)
                    setConversation(user)
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
          <>
            <div className='flex flex-row gap-2 items-center justify-between'>
              <span className='font-light tracking-tight text-lg'>
                Conversations
              </span>
              <div
                onClick={() => setShowModal(true)}
                className='border rounded-md p-1 cursor-pointer transition duration-150 hover:bg-gray-300'
              >
                <PlusIcon className='w-5 h-5' />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              {conversations?.length !== 0 &&
                conversations?.map((conversation: IConversation) => {
                  let name
                  if (conversation.users.length === 1) {
                    name = `${conversation.users[0].firstName} ${conversation.users[0].lastName}`
                  } else {
                    console.log(conversation)
                    name =
                      conversation.name ??
                      `Group: ${conversation.users.reduce(
                        (acc: string, curr: ChatUser) =>
                          `${acc}, ${curr.firstName}`,
                        ''
                      )}`
                  }

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        console.log('clicked conversation: ', conversation)
                        setConversation(conversation)
                      }}
                      className='px-2 py-2 flex flex-col font-light tracking-tight rounded-md bg-white cursor-pointer hover:outline hover:outline-1'
                    >
                      <div className='flex flex-row gap-2'>
                        <div>{name}</div>
                        {/* {user.active && (
                          <div className='bg-green-500 rounded-full w-3 h-3' />
                        )} */}
                      </div>
                      <div className='font-light text-xs text-gray-700'>
                        <div className='truncate w-44'>
                          {`${
                            conversation.latest.user._id === user._id
                              ? 'You: '
                              : `${conversation.latest.user.firstName}: `
                          }${conversation.latest.text}`}{' '}
                        </div>
                      </div>
                      <div className='mt-1 self-end tracking-tighter font-light text-xs text-gray-500'>
                        {dayjs(conversation.latest.createdAt).fromNow()}
                      </div>
                    </div>
                  )
                })}
            </div>
          </>
        )}
      </div>
      <MyModal
        show={showModal}
        setShow={setShowModal}
        onConfirm={createNewConversation}
        confirmText='Create conversation'
      >
        <>
          <h1 className='my-2 font-light text-lg tracking-tight text-gray-900'>
            Add users to group conversation
          </h1>
          <span className='text-gray-700 font-light'>Added friends</span>
          <div className='flex flex-col gap-2 '>
            {newConversationUsers.map((user: any) => (
              <div
                key={user._id}
                onClick={() => console.log(user)}
                className='flex flex-row items-center justify-between border rounded-md px-2 py-1'
              >
                <span>
                  {user.firstName} {user.lastName}
                </span>
                <div
                  onClick={() => {
                    setNewConversationUsers((prev: any[]) =>
                      prev.filter((u: any) => u._id !== user._id)
                    )
                  }}
                  className='border rounded-md p-1 cursor-pointer hover:bg-gray-100'
                >
                  <XIcon className='w-5 h-5' />
                </div>
              </div>
            ))}
          </div>
          {newConversationUsers.length !== 0 && (
            <div className='border border-black my-2' />
          )}
          <span className='text-gray-700 font-light'>Friends</span>
          <div className='flex flex-col gap-2 '>
            {user.friends
              ?.filter((u: any) => !newConversationUsers.includes(u))
              .map((user: any) => (
                <div
                  key={user._id}
                  onClick={() => console.log(user)}
                  className='flex flex-row items-center justify-between border rounded-md px-2 py-1'
                >
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <div
                    onClick={() => {
                      setNewConversationUsers((prev: any[]) => [...prev, user])
                    }}
                    className='border rounded-md p-1 cursor-pointer hover:bg-gray-100'
                  >
                    <PlusIcon className='w-5 h-5' />
                  </div>
                </div>
              ))}
          </div>
        </>
      </MyModal>
    </div>
  )
}

export default Nav

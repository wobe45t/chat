import { useState, useContext, useEffect, memo } from 'react'
import {
  LogoutIcon,
  PlusIcon,
  UserIcon,
  BellIcon,
  UserAddIcon,
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
import { inviteFriend, removeFriend } from '../actions/friends'
import { IConversation } from '../interfaces/conversation'
import { ChatUser } from '../interfaces/conversation'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

enum View {
  CHATS,
  ALL,
}

const Nav = () => {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const { reset: resetSocket } = useContext(SocketContext)

  const {
    setConversation,
    conversation,
    reset: resetChat,
    conversations,
    setConversations,
  } = useContext(ChatContext)

  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>(View.CHATS)
  const [showModal, setShowModal] = useState<boolean>(false)

  const { mutate: inviteFriendMutate } = useMutation(
    (userId: string) => inviteFriend(userId),
    {
      onSuccess: (data) => {
        console.log('invite success data: ', data)
      },
      onError: (error: any) => {
        console.log('invite error')
        toast.error(error.response.data.message, { autoClose: 1000 })
      },
    }
  )
  const { mutate: removeFriendMutate } = useMutation(
    (userId: string) => removeFriend(userId),
    {
      onSuccess: (data) => {
        console.log('remove success data: ', data)
        setUser(data)
      },
      onError: (error: any) => {
        console.log('remove error')
        toast.error(error.response.data.message, { autoClose: 1000 })
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
          {user?.firstName} {user?.lastName}
        </div>
      </div>
      <div
        onClick={() => navigate('/notifications')}
        className='border flex flex-row items-center gap-2 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-700 hover:text-white'
      >
        <BellIcon className='w-5 h-5' />
        <div className='w-full flex flex-row justify-between'>
          <div>Requests</div>
          {user?.friendRequests?.length !== 0 && (
            <div className='text-green-700'>{user?.friendRequests?.length}</div>
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
              .filter((u: any) => u._id !== user?._id)
              .map((appUser: any, index: number) => (
                <div
                  key={index}
                  className='flex flex-row items-center border rounded-md p-2 gap-3 font-light text-lg tracking-tighter bg-white'
                >
                  <div className='w-full ml-1 flex flex-row gap-2 justify-between items-center'>
                    <div>
                      {appUser.firstName} {appUser.lastName}
                    </div>
                    <div className='flex flex-row gap-2'>
                      <button
                        className='border rounded-md p-2 cursor-pointer hover:bg-gray-100 disabled:bg-green-100 disabled:border-green-200 disabled:cursor-auto'
                        onClick={() => removeFriendMutate(appUser._id)}
                      >
                        <XIcon className='w-5 h-5' />
                      </button>
                      <button
                        className='border rounded-md p-2 cursor-pointer hover:bg-gray-100 disabled:bg-green-100 disabled:border-green-200 disabled:cursor-auto'
                        onClick={() => inviteFriendMutate(appUser._id)}
                        disabled={user?.friends
                          ?.map((u: any) => u._id)
                          .includes(appUser._id)}
                      >
                        <UserAddIcon className='w-5 h-5' />
                      </button>
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
                conversations?.map((conv: IConversation) => {
                  let name
                  if (conv.users.length === 2) {
                    const convUser = conv.users.find(
                      (chatUser: ChatUser) => chatUser.user._id !== user?._id
                    )
                    name = `${convUser?.user.firstName} ${convUser?.user.lastName}`
                  } else {
                    name =
                      conv.name ??
                      `Group: ${conv.users.reduce(
                        (acc: string, curr: ChatUser) =>
                          `${acc}, ${curr.user.firstName}`,
                        ''
                      )}`
                  }

                  return (
                    <div
                      key={conv._id}
                      onClick={() => {
                        if (conversation?._id !== conv._id) {
                          console.log('clicked conversation: ', conv)
                          setConversation(conv)
                        }
                      }}
                      className={`p-2 flex flex-col font-light tracking-tight rounded-md border bg-white text-gray-700 cursor-pointer
                            ${
                              conv?.users?.find(
                                (chatUser: ChatUser) =>
                                  chatUser.user._id === user?._id
                              )?.lastRead !== conv.latest._id &&
                              conv.latest.user._id !== user?._id
                                ? 'text-black font-semibold'
                                : ''
                            }
                      hover:outline hover:outline-1`}
                    >
                      <div>{name}</div>
                      <div className='text-[10px] flex flex-col'>
                        <div>
                          Conv user:{' '}
                          {
                            conv.users.find(
                              (chatUser: ChatUser) =>
                                chatUser.user._id === user?._id
                            )?.lastRead
                          }
                        </div>
                        <div>Conv latest: {conv.latest._id}</div>
                      </div>
                      {conv.latest.user && (
                        <>
                          <div className={`text-xs`}>
                            <div className='truncate w-44'>
                              {`${
                                conv.latest.user._id === user?._id
                                  ? 'You: '
                                  : `${conv.latest.user.firstName}: `
                              }${conv.latest.text}`}{' '}
                            </div>
                          </div>
                          <div className='mt-1 self-end tracking-tighter font-light text-xs text-gray-500'>
                            {dayjs(conv.latest.createdAt).fromNow()}
                          </div>
                        </>
                      )}
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
            {user?.friends
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

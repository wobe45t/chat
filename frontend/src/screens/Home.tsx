import React, {
  useEffect,
  useRef,
  useContext,
  useState,
  ReactHTMLElement,
} from 'react'
import Nav from '../components/Nav'
import { ChatContext } from '../context/chatContext'
import { useSocket } from '../context/socketContext'
import { UserContext } from '../context/userContext'
import {
  PlusIcon,
  UserAddIcon,
  ChevronRightIcon,
} from '@heroicons/react/outline'
import { useMutation, useQuery } from 'react-query'
import { inviteFriend } from '../actions/friends'
import { toast } from 'react-toastify'
import { addMessage } from '../actions/messages'
import dayjs from 'dayjs'
import { getConversation } from '../actions/conversations'

const Home = () => {
  const socket = useSocket()
  const {
    conversation,
    conversations,
    setConversations,
    setConversation,
    appendMessage,
  } = useContext(ChatContext)
  const { user } = useContext(UserContext)
  const [value, setValue] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)
  const messageContainer = useRef<HTMLDivElement>(null)

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
  const { mutate: addMessageMutate } = useMutation(
    (args: { conversation_id: string; text: string }) =>
      addMessage(args.conversation_id, args.text),
    {
      onSuccess: (data) => {
        appendMessage(data)
      },
      onError: (error) => {
        console.error('message add error')
      },
    }
  )

  useEffect(() => {
    if (!conversation?._id) return
    getConversation(conversation?._id).then((data) => {
      console.log('home conversation: ', data)
      setConversation(data)
    })
  }, [conversation?._id])

  const submitForm = (e: any) => {
    e.preventDefault()
    addMessageMutate({ conversation_id: conversation?._id!, text: value })
    setValue('')
  }

  // HANDLE SCROLLING
  const onScroll = () => {
    if (messageContainer.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainer.current
      if (scrollTop + clientHeight === scrollHeight) {
        console.log('reached bottom')
      }
    }
  }
  useEffect(() => {
    chatEnd.current?.scrollIntoView()
  }, [conversation])

  return (
    <div className='flex w-full h-screen'>
      <div className='w-full flex flex-row border rounded-md'>
        <div>
          <Nav />
        </div>
        <div className='w-full flex flex-col'>
          {/* <div>{JSON.stringify(conversation?.messages?.slice(-5))}</div> */}
          <div className='flex flex-col flex-grow overflow-y-auto'>
            {conversation?._id ? (
              <>
                <div className='p-2 flex flex-col items-center border-b-2'>
                  <div className='tracking-normal text-xl font-light'>
                    {conversation?.users[0].firstName}{' '}
                    {conversation?.users[0].lastName}
                  </div>
                  {/* {conversation?.active ? (
                    <div className='flex flex-row items-center gap-1 font-light tracking-tight text-xs'>
                      <div className='bg-green-500 rounded-full w-3 h-3' />
                      <span>Active now</span>
                    </div>
                  ) : (
                    <div>Last acive ...</div>
                  )} */}
                </div>
                {/* <div className='p-3 flex flex-row justify-between items-center  bg-gray-100 border-b-2'>
                  {user.friends
                    ?.map((friend: any) => friend._id)
                    .includes(conversation?._id) ? (
                    <div className='flex flex-col items-center gap-1'>
                      <div className='font-light text-xs'>
                        Friend since date{' '}
                      </div>
                      <div>Remove friend</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        inviteFriendMutate(conversation?._id!)
                      }}
                      className='border px-2 py-1 flex flex-row gap-1 items-center transition duration-150 hover:bg-gray-200'
                    >
                      <PlusIcon className='w-5 h-5' />
                      <span>Friend request</span>
                    </button>
                  )}
                </div> */}

                <div
                  ref={messageContainer}
                  onScroll={onScroll}
                  className='overflow-y-auto'
                >
                  <div className='flex flex-col p-3 gap-1 justify-starts'>
                    {conversation?.messages?.map(
                      (message: any, index: number, arr: any[]) => (
                        <React.Fragment key={message._id || index}>
                          {message.user._id !== user?._id &&
                            arr[index - 1]?.user._id !== message?.user._id && (
                              <div className='ml-1 text-xs font-light tracking-tight'>
                                <span>{user?.firstName}</span>
                              </div>
                            )}
                          <div
                            onClick={() => alert(JSON.stringify(message))}
                            className={`font-light tracking-tight rounded-lg px-2 py-1 w-1/3 ${
                              message.user._id !== user?._id
                                ? 'self-start bg-gray-100'
                                : 'self-end bg-blue-500 text-white'
                            }
                            ${
                              arr[index + 1]?.user._id === message.user._id &&
                              'rounded-b-none'
                            }
                            ${
                              arr[index - 1]?.user._id === message.user._id &&
                              'rounded-t-none'
                            }
                            ${
                              arr[index - 1]?.user._id === message.user._id &&
                              arr[index + 1]?.user._id === message.user._id &&
                              'rounded-none'
                            }`}
                          >
                            {message.text}
                          </div>
                          {message.user._id !== user?._id &&
                            arr[index + 1]?.user._id !== message?.user._id && (
                              <div className='ml-1 text-xs font-light tracking-tight text-gray-500'>
                                <span>
                                  {dayjs(message?.createdAt).fromNow()}
                                </span>
                              </div>
                            )}
                        </React.Fragment>
                      )
                    )}
                    <div ref={chatEnd} />
                  </div>
                </div>
              </>
            ) : (
              <div className='font-light text-xl text-center'>
                Select user to chat with!
              </div>
            )}
          </div>
          <form
            className='w-full border-t flex flex-row items-center p-2 gap-2'
            onSubmit={submitForm}
          >
            <button
              onClick={() => alert('add image')}
              className='border p-2 rounded-md my-2 transition duration-150 hover:bg-gray-100'
            >
              <PlusIcon className='w-5 h-5' />
            </button>
            <input
              className='w-full h-10 border px-2 py-1 rounded-md'
              value={value}
              onChange={(e) => {
                setValue(e.currentTarget.value)
              }}
            />
            <button
              className='border p-2 rounded-md my-2 transition duration-150 hover:bg-gray-100'
              type='submit'
            >
              <ChevronRightIcon className='w-5 h-5' />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home

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
  EyeIcon,
  ReplyIcon,
  DotsHorizontalIcon,
} from '@heroicons/react/outline'
import { useMutation, useQuery } from 'react-query'
import { inviteFriend } from '../actions/friends'
import { toast } from 'react-toastify'
import { addMessage } from '../actions/messages'
import dayjs from 'dayjs'
import {
  getConversation,
  leaveConversation,
  markReadLatestMessage,
} from '../actions/conversations'
import { ChatUser, Message } from '../interfaces/conversation'
import { IConversation } from '../interfaces/conversation'

const Home = () => {
  const socket = useSocket()
  const {
    activeUsers,
    conversation,
    conversations,
    setConversations,
    setConversation,
    appendMessage,
    conversationUserUpdate,
  } = useContext(ChatContext)
  const { user } = useContext(UserContext)
  const [value, setValue] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)
  const messageContainer = useRef<HTMLDivElement>(null)

  const { mutate: addMessageMutate } = useMutation(
    (args: { conversation_id: string; text: string }) =>
      addMessage(args.conversation_id, args.text),
    {
      onSuccess: (data) => {
        setConversation((prev: any) => {
          if (data.conversationId === prev?._id) {
            const prevMessages =
              prev?.messages?.length !== 0 ? prev.messages : []
            prevMessages.push(data.message)
            return { ...prev, messages: prevMessages, latest: data.message }
          }
          return prev
        })
        setConversations((prev: IConversation[]) => {
          return prev.map((conversation: IConversation) => {
            if (conversation._id === data.conversationId) {
              return { ...conversation, latest: data.message }
            }
            return conversation
          })
        })
      },
      onError: (error) => {
        console.error('message add error')
      },
    }
  )

  useEffect(() => {
    if (!conversation?._id) return
    getConversation(conversation?._id).then((data) => {
      setConversation(data)
    })
    if (!user?._id) return
    if (
      conversation.users.find(
        (chatUser: ChatUser) => chatUser.user._id === user._id
      )?.lastRead !== conversation.latest?._id
    ) {
      console.log('')
      markReadLatestMessage(conversation._id, conversation.latest?._id).then(
        (data) => {
          conversationUserUpdate(data)
        }
      )
    } else {
      console.warn('No need to update latest message - already read')
    }
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

  const handleLeaveConversation = () => {
    leaveConversation(conversation?._id!).then(({ conversationId }) => {
      console.log('leave conversation: ', conversation?._id)
      setConversations((prev: IConversation[]) =>
        prev.filter((conv: IConversation) => conv._id !== conversationId)
      )
      setConversation(null)
    })
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
        {conversation !== null ? (
          <div className='w-full flex flex-col'>
            <div className='flex flex-col flex-grow overflow-y-auto'>
              {conversation?._id ? (
                <>
                  <div className='p-2 flex flex-row border-b-2 justify-between items-center'>
                    <div className='tracking-normal text-xl font-light'>
                      {conversation.name ?? conversation.users.length === 2 ? (
                        <>
                          {
                            conversation?.users.find(
                              (chatUser: ChatUser) =>
                                chatUser.user._id !== user?._id
                            )?.user.firstName
                          }
                        </>
                      ) : (
                        conversation?.users
                          .map((chatUser: ChatUser) => chatUser.user.firstName)
                          .join(', ')
                      )}
                    </div>
                    <div
                      onClick={handleLeaveConversation}
                      className='p-2 rounded-md cursor-pointer hover:bg-gray-100'
                    >
                      <DotsHorizontalIcon className='w-5 h-5' />
                    </div>
                  </div>
                  <div
                    ref={messageContainer}
                    onScroll={onScroll}
                    className='overflow-y-auto'
                  >
                    <div className='flex flex-col p-3 gap-[2px] justify-starts'>
                      {conversation?.messages?.map(
                        (message: Message, index: number, arr: Message[]) => (
                          <React.Fragment key={message._id || index}>
                            {message.user._id !== user?._id &&
                              arr[index - 1]?.user._id !==
                                message?.user._id && (
                                <div className='ml-1 text-xs font-light tracking-tight'>
                                  <span>{message.user?.firstName}</span>
                                </div>
                              )}
                            <div
                              className={`flex flex-row gap-1 text-sm  max-w-[80%] md:max-w-[60%] lg:max-w-[40%] ${
                                message.user._id !== user?._id
                                  ? 'self-start'
                                  : 'self-end flex-row-reverse'
                              }
                                `}
                            >
                              <div
                                onClick={() =>
                                  console.log('Clicked message: ', message)
                                }
                                className={`flex flex-grow break-all rounded-2xl font-light tracking-tight px-2 py-1
                                  ${
                                    message.user._id !== user?._id
                                      ? 'bg-gray-100'
                                      : 'bg-blue-500 text-white'
                                  }
                                  ${
                                    arr[index + 1]?.user._id ===
                                      message.user._id && 'rounded-b-md'
                                  }
                                  ${
                                    arr[index - 1]?.user._id ===
                                      message.user._id && 'rounded-t-md'
                                  }
                                  ${
                                    arr[index - 1]?.user._id ===
                                      message.user._id &&
                                    arr[index + 1]?.user._id ===
                                      message.user._id &&
                                    'rounded-md'
                                  }
                                `}
                              >
                                {message.text}
                              </div>
                              <div className='flex flex-row gap-1'>
                                {/* <div
                                    onClick={() => alert('reply')}
                                    className='inline-block rounded-full cursor-pointer p-2 transition text-gray-600 hover:bg-gray-100'
                                  >
                                    <ReplyIcon className='w-4 h-4' />
                                  </div> */}
                              </div>
                            </div>
                            {message.user._id !== user?._id &&
                              arr[index + 1]?.user._id !==
                                message?.user._id && (
                                <div className='ml-1 text-xs font-light tracking-tight text-gray-500'>
                                  <span>
                                    {dayjs(message?.createdAt).fromNow()}
                                  </span>
                                </div>
                              )}
                            <div className='flex flex-row gap-1 font-light text-xs self-end'>
                              {conversation.users.reduce(
                                (acc, curr) =>
                                  `${acc}${
                                    curr.lastRead === message._id &&
                                    curr.user._id !== user?._id &&
                                    message.user._id !== curr.user._id
                                      ? ` ${curr.user.firstName}`
                                      : ''
                                  }`,
                                ''
                              )}
                            </div>
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
        ) : (
          <div className='' />
        )}
      </div>
    </div>
  )
}

export default Home

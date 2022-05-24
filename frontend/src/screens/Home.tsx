import React, { useEffect, useContext, useState } from 'react'
import Nav from '../components/Nav'
import { ChatContext } from '../context/chatContext'
import { useSocket } from '../context/socketContext'
import { UserContext } from '../context/userContext'
import {
  PlusIcon,
  UserAddIcon,
  ChevronRightIcon,
} from '@heroicons/react/outline'
import { useMutation } from 'react-query'
import { inviteFriend } from '../actions/friends'
import { toast } from 'react-toastify'

const Home = () => {
  const socket = useSocket()
  const { chat, messages, appendMessage } = useContext(ChatContext)
  const { user } = useContext(UserContext)
  const [value, setValue] = useState('')

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

  const submitForm = (e: any) => {
    e.preventDefault()
    const message = {
      chatId: chat.chatId,
      text: value,
      to: chat.user?.id,
    }

    socket?.emit('message', message)
    appendMessage(chat.user?.id, {
      from: user.id,
      to: chat.user?.id,
      text: value,
    })
    setValue('')
  }

  const logMessages = () => {
    console.log('ID:', chat.user?.id)
    chat.user?.id && console.table(messages[chat.user?.id])
  }

  return (
    <div className='flex w-full h-screen'>
      <div className='w-full flex flex-row border rounded-md'>
        <div>
          <Nav />
        </div>
        <div className='w-full flex flex-col'>
          <div className='flex flex-col flex-grow overflow-y-auto'>
            {chat.chatId ? (
              <>
                <div className='p-2 flex flex-col items-center border-b-2'>
                  <div className='tracking-normal text-xl font-light'>
                    {chat.user?.firstName} {chat.user?.lastName}
                  </div>
                  <div className='flex flex-row items-center gap-1 font-light tracking-tight text-xs'>
                    <div className='bg-green-500 rounded-full w-3 h-3' />
                    <span>Active now</span>
                  </div>
                </div>
                <div className='p-3 flex flex-row justify-between items-center  bg-gray-100 border-b-2'>
                  <div className='flex flex-col gap-2 font-light text-xs'>
                    <div>UserId: {chat.user?.id}</div>
                    <div>ChatId: {chat.chatId}</div>
                  </div>
                  {user.friends?.includes(chat.user?.id) ? (
                    <div className='flex flex-col items-center gap-1'>
                      <div className='font-light text-xs'>
                        Friend since date{' '}
                      </div>
                      <div>Remove friend</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        // socket?.emit('add-friend', {
                        //   chatId: chat.chatId,
                        //   from: user.id,
                        //   to: chat.user?.id,
                        // })
                        inviteFriendMutate(chat.user?.id!)
                      }}
                      className='border px-2 py-1 flex flex-row gap-1 items-center transition duration-150 hover:bg-gray-200'
                    >
                      <PlusIcon className='w-5 h-5' />
                      <span>Friend request</span>
                    </button>
                  )}
                </div>

                <div className='overflow-y-auto'>
                  <div className='flex flex-col p-3 gap-1 justify-starts'>
                    {chat.user?.id &&
                      messages[chat.user.id]?.map(
                        (message: any, index: number, arr: any[]) => (
                          <div
                            key={index}
                            className={`font-light tracking-tight rounded-lg px-2 py-1 w-1/3 ${
                              message.from === chat.user?.id
                                ? 'self-start bg-gray-100'
                                : 'self-end bg-blue-500 text-white'
                            } 
                          ${
                            arr[index + 1]?.to === message.to &&
                            'rounded-b-none'
                          }
                          ${
                            arr[index - 1]?.to === message.to &&
                            'rounded-t-none'
                          }
                          ${
                            arr[index - 1]?.to === message.to &&
                            arr[index + 1]?.to === message.to &&
                            'rounded-none'
                          }`}
                          >
                            {message.text}
                          </div>
                        )
                      )}
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
              onClick={() => alert('add people to the chat')}
              className='border p-2 rounded-md my-2 transition duration-150 hover:bg-gray-100'
            >
              <UserAddIcon className='w-5 h-5' />
            </button>
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

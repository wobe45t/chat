import React, { useEffect, useContext, useState } from 'react'
import Nav from '../components/Nav'
import { ChatContext } from '../context/chatContext'
import { useSocket } from '../context/socketContext'
import { UserContext } from '../context/userContext'
import { PlusIcon } from '@heroicons/react/outline'

const Home = () => {
  const socket = useSocket()
  const { chat, messages, appendMessage } = useContext(ChatContext)
  const { user } = useContext(UserContext)

  const [value, setValue] = useState('')

  const submitForm = (e: any) => {
    e.preventDefault()
    const message = {
      chatId: chat.chatId,
      text: value,
      to: chat.userId,
    }

    socket?.emit('message', message)
    appendMessage(chat.userId, { from: user._id, to: chat.userId, text: value })
    setValue('')
  }

  const logMessages = () => {
    console.log('ID:', chat.userId)
    console.table(messages[chat.userId])
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
                <div className='p-3 text-center tracking-tighter font-light border-b-2'>
                  Messages
                </div>
                <div className='p-3 flex flex-row justify-between items-center  bg-gray-100 border-b-2'>
                  <div className='flex flex-col gap-2 font-light text-xs'>
                    <div>UserId: {chat.userId}</div>
                    <div>ChatId: {chat.chatId}</div>
                  </div>
                  {user.friends?.includes(chat.userId) ? (
                    <div className='flex flex-col items-center gap-1'>
                      <div className='font-light text-xs'>
                        Friend since date </div>
                      <div>Remove friend</div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        socket?.emit('add-friend', {
                          chatId: chat.chatId,
                          from: user._id,
                          to: chat.userId,
                        })
                      }}
                      className='px-2 py-1 self-end rounded-md cursor-pointer text-blue-700 hover:text-blue-900'
                    >
                      Friend request
                    </div>
                  )}
                </div>

                <div className='overflow-y-auto'>
                  <div className='flex flex-col p-3 gap-1 justify-starts'>
                    {messages[chat.userId]?.map(
                      (message: any, index: number, arr: any[]) => (
                        <div
                          key={index}
                          className={`font-light tracking-tight rounded-lg px-2 py-1 w-1/3 ${
                            message.from === chat.userId
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
            className='w-full border-t flex flex-row p-2 gap-2'
            onSubmit={submitForm}
          >
            <input
              className='w-full border py-1 px-2 rounded-md'
              placeholder='message'
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.currentTarget.value)
              }}
            />
            <button className='border p-2 rounded-md my-2' type='submit'>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home

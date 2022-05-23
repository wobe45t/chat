import React, { useEffect, useState } from 'react'

const Messages = (props: { socket: any }) => {
  const { socket } = props
  const [messages, setMessages] = useState({})

  useEffect(() => {
    const messageListener = (message: any) => {
      setMessages((prevMessages: any) => {
        const newMessages = { ...prevMessages }
        newMessages[message.id] = message
        return newMessages
      })
    }

    const deleteMessageListener = (messageID: any) => {
      setMessages((prevMessages: any) => {
        const newMessages = { ...prevMessages }
        delete newMessages[messageID]
        return newMessages
      })
    }

    socket.on('message', messageListener)
    socket.on('deleteMessage', deleteMessageListener)
    socket.emit('getMessages')

    return () => {
      socket.off('message', messageListener)
      socket.off('deleteMessage', deleteMessageListener)
    }
  }, [socket])

  return (
    <div className='message-list'>
      {[...Object.values(messages)]
        .sort((a: any, b: any) => a.time - b.time)
        .map((message: any) => (
          <div
            key={message.id}
            className='message-container'
            title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
          >
            <span className='user'>{message.user.name}:</span>
            <span className='message'>{message.value}</span>
            <span className='date'>
              {new Date(message.time).toLocaleTimeString()}
            </span>
          </div>
        ))}
    </div>
  )
}

export default Messages

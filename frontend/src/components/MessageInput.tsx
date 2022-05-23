import React, { useState } from 'react'

const NewMessage = (props: { socket: any }) => {
  const { socket } = props
  const [value, setValue] = useState('')

  const submitForm = (e: any) => {
    e.preventDefault()
    console.log('emiting ', value);
    socket.emit('message', value)
    setValue('')
  }

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={value}
        placeholder='Type your message'
        onChange={(e) => {
          setValue(e.currentTarget.value)
        }}
      />
      <button type='submit'>
        Submit
      </button>
    </form>
  )
}

export default NewMessage

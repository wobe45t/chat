import { useContext } from 'react'
import { UserContext } from '../context/userContext'
import { useSocket } from '../context/socketContext'

const Notifications = () => {
  const { user } = useContext(UserContext)
  const socket = useSocket()

  return (
    <div className='container mx-auto'>
      <div className='text-xl font-light'>Notifications</div>
      <div className='flex flex-col gap-2'>
        {user.friendRequests?.map((request: any, index: number) => (
          <div
            key={index}
            className='flex flex-row justify-between border rouned-md px-3 py-2'
          >
            <div>Request: {JSON.stringify(request)}</div>
            <div className='flex flex-row gap-2'>
              <div
                className='cursor-pointer font-light tracking-tight hover:text-green-700'
                onClick={() => {
                  socket?.emit('accept-friend-request', { from: request })
                }}
              >
                Accept
              </div>
              <div
                className='cursor-pointer font-light tracking-tight hover:text-red-700'
                onClick={() => {
                  socket?.emit('decline-friend-request', { from: request })
                }}
              >
                Decline
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications

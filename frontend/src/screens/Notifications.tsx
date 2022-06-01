import { useContext } from 'react'
import { UserContext } from '../context/userContext'
import { useSocket } from '../context/socketContext'
import { useMutation } from 'react-query'
import { IUser } from '../interfaces/user'
import {
  acceptFriendInvitation,
  declineFriendInvitation,
} from '../actions/friends'
import { toast } from 'react-toastify'

const Notifications = () => {
  const { user, setUser } = useContext(UserContext)
  const socket = useSocket()

  const { mutate: acceptFriendInvitationMutate } = useMutation(
    (userId: string) => acceptFriendInvitation(userId),
    {
      onSuccess: (data) => {
        toast.success('Invitation accepted', { autoClose: 500 })
        console.log('accept inv success: ', data)
        setUser((prev: IUser) => ({ ...prev, ...data }))
      },
      onError: (error) => {
        toast.error('Couldnt accept invitation', { autoClose: 500 })
        console.log('accept inv error: ', error)
      },
    }
  )

  const { mutate: declineFriendInvitationMutate } = useMutation(
    (userId: string) => declineFriendInvitation(userId),
    {
      onSuccess: (data) => {
        toast.success('Invitation declined', { autoClose: 500 })
        setUser((prev: IUser) => ({ ...prev, ...data }))
      },
      onError: (error) => {
        toast.error('Couldnt decline invitation', { autoClose: 500 })
      },
    }
  )
  return (
    <div className='container mx-auto'>
      <div className='text-xl font-light'>Notifications</div>
      {user?.friendRequests?.length === 0 ? (
        <div className='text-xl font-light tracking-tight'>
          No friend notifications found
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {user?.friendRequests?.map((user: any, index: number) => (
            <div
              key={index}
              className='flex flex-row justify-between border rouned-md px-3 py-2'
            >
              <div>
                {user.firstName} {user.lastName} invited you!
              </div>
              <div className='flex flex-row gap-2'>
                <div
                  className='cursor-pointer font-light tracking-tight hover:text-green-700'
                  onClick={() => {
                    acceptFriendInvitationMutate(user._id)
                  }}
                >
                  Accept
                </div>
                <div
                  className='cursor-pointer font-light tracking-tight hover:text-red-700'
                  onClick={() => {
                    declineFriendInvitationMutate(user._id)
                  }}
                >
                  Decline
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications

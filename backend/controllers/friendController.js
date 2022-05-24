const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')
const User = require('../models/userModel')

const addFriendInvitation = asyncHandler(async (req, res) => {
  console.log('search for ', req.params.id)
  console.log('current user', req.user.id)

  const users = await User.find({
    $and: [
      { _id: req.params.id },
      {
        $or: [{ friendRequests: req.user.id }, { friends: req.user.id }],
      },
    ],
  })
  console.log('users: ', users)
  const io = req.app.get('socketio')

  if (users.length === 0) {
    await User.findByIdAndUpdate(req.params.id, {
      $push: { friendRequests: req.user.id },
    })
    const socket = findUserSocket(io.of('/ws').sockets, req.params.id)
    console.log('socket: ', socket)
    if (socket) {
      io.to(socket).emit('friend-request', { from: req.user.id })
      console.log('message emitted')
    }
    res.status(200)
    return
  } else {
    res.status(409)
    throw new Error('Already a friend')
  }
})

const acceptFriendInvitation = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { friendRequests: req.params.id },
      $push: { friends: req.params.id },
    },
    { new: true }
  )
    .populate([
      {
        path: 'friends',
        select: '-password -friends -friendRequests',
      },
      {
        path: 'friendRequests',
        select: '-password -friends -friendRequests',
      },
    ])
    .select('-password')

  const socket = findUserSocket(io.of('/ws').sockets, req.params.id)

  console.log('socket: ', socket)

  if (socket) {
    io.to(socket).emit('friend-request', { message: 'Request accepted' })
  }
  res.status(200).json(user.toClient())
})

const declineFriendInvitation = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { friendRequests: req.params.id },
    },
    { new: true }
  )
    .populate([
      {
        path: 'friends',
        select: '-password -friends -friendRequests',
      },
      {
        path: 'friendRequests',
        select: '-password -friends -friendRequests',
      },
    ])
    .select('-password')

  res.status(200).json(user.toClient())
})
module.exports = {
  addFriendInvitation,
  acceptFriendInvitation,
  declineFriendInvitation
}

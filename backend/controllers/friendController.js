const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')
const User = require('../models/userModel')
const Conversation = require('../models/conversationModel')
const { isObjectIdOrHexString } = require('mongoose')

const removeFriend = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pop: { friends: req.params.id },
      },
      { new: true }
    )
    res.status(200).json(user)
  } catch (error) {
    res.status(400)
    throw new Error(error)
  }
})

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

  const io = req.app.get('socketio')

  if (users.length === 0) {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: { friendRequests: req.user.id },
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
      io.of('/ws').to(socket).emit('friend-request', { user })
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
  const userInvited = await User.findByIdAndUpdate(
    req.user._id,
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

  const userInviting = await User.findByIdAndUpdate(
    req.params.id,
    {
      $push: { friends: req.user._id },
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

  const _conversation = await Conversation.create({
    users: [{ user: userInvited._id }, { user: userInviting._id }],
  })
  const conversation = await Conversation.aggregate([
    { $match: { 'users.user': _conversation._id } },
    { $unset: 'messages' },
    {
      $lookup: {
        from: 'users',
        localField: 'users.user',
        foreignField: '_id',
        as: 'users.user',
      },
    },
    {
      $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
        (value) => `users.user.${value}`
      ),
    },
  ])
  console.log('ACCEPT FRIEND: ', conversation)

  // const socketInvited = findUserSocket(io.of('/ws').sockets, req.user.id)
  // if (socketInvited) {
  //   io.of('/ws').to(socketInvited).emit('friend-request', { user: userInvited })
  // }

  const socketInviting = findUserSocket(io.of('/ws').sockets, req.params.id)
  const socketInvited = findUserSocket(io.of('/ws').sockets, req.user._id)
  if (socketInviting) {
    io.of('/ws')
      .to(socketInviting)
      .emit('friend-request', { user: userInviting })
    io.of('/ws').to(socketInviting).emit('conversation-added', { conversation })
    io.of('/ws').to(socketInvited).emit('conversation-added', { conversation })
  }
  res.status(200).json(userInvited)
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
  declineFriendInvitation,
  removeFriend
}

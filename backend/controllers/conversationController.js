const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')
const mongoose = require('mongoose')
const Message = require('../models/messageModel')
const Conversation = require('../models/conversationModel')

const getConversations = asyncHandler(async (req, res) => {
  const _conversations = await Conversation.aggregate([
    { $match: { users: req.user._id } },
    {
      $project: {
        users: {
          $filter: {
            input: '$users',
            as: 'users',
            cond: {
              $and: [{ $ne: ['$$users', req.user._id] }],
            },
          },
        },
        latest: {
          $arrayElemAt: [{ $slice: ['$messages', -1] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'latest',
        foreignField: '_id',
        as: 'latest',
      },
    },
    {
      $set: { latest: { $arrayElemAt: ['$latest', 0] } },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'latest.user',
        foreignField: '_id',
        as: 'latest.user',
      },
    },
    { $unwind: '$latest.user' },
    {
      $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
        (value) => `latest.user.${value}`
      ),
    },
  ])
  const conversations = await Conversation.populate(_conversations, [
    { path: 'users', select: '-password -friends -friendRequests' },
  ])

  res.status(200).json(conversations)
})

const getConversation = asyncHandler(async (req, res) => {
  const _conversations = await Conversation.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    {
      $project: {
        messages: 1,
        users: {
          $filter: {
            input: '$users',
            as: 'users',
            cond: {
              $and: [{ $ne: ['$$users', req.user._id] }],
            },
          },
        },
      },
    },
  ])
  const conversations = await Conversation.populate(_conversations, [
    { path: 'users', select: '-password -friends -friendRequests' },
    {
      path: 'messages',
      populate: { path: 'user', select: '-password -friends -friendRequests' },
    },
  ])
  res.status(200).json(conversations[0])
})

const addGroupConversation = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')

  // if (!req.body.text) {
  //   res.status(400)
  //   throw new Error('No mesasge found')
  // }

  const conversation = await Conversation.create({
    name: req.body.name,
    users: req.body.users,
  })

  if (!conversation) {
    res.status(400)
    throw new Error('Coulnt create conversation')
  }

  conversation.users.forEach((user) => {
    if (user._id === req.user._id) return
    const socket = findUserSocket(io.of('/ws').sockets, user._id)
    if (socket) {
      io.of('/ws').to(socket).emit('conversation-created', conversation)
    } else {
      console.warn('User not logged in')
    }
  })

  res.status(200).json(msg)
})

module.exports = {
  getConversation,
  getConversations,
}

const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')
const mongoose = require('mongoose')

const Message = require('../models/messageModel')
const Conversation = require('../models/conversationModel')

const addMessage = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')

  if (!req.body.text) {
    res.status(400)
    throw new Error('No mesasge found')
  }

  const msg = await Message.create({
    text: req.body.text,
    user: req.user._id,
  })

  const conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    {
      $push: { messages: msg },
    },
    {
      new: true,
    }
  ).populate({ path: 'users', select: '-password -friends -friendRequests' })

  const message = await Message.populate(msg, [
    { path: 'user', select: '-password -friends -friendRequests' },
  ])

  conversation.users.forEach((user, index) => {
    if (user._id.equals(req.user._id)) {
      console.log('User from request')
      return
    }
    const socket = findUserSocket(io.of('/ws').sockets, user._id)
    if (socket) {
      io.of('/ws')
        .to(socket)
        .emit('message', { conversationId: req.params.id, message })
    } else {
      console.warn('user not logged in')
    }
  })

  res.status(200).json({ conversationId: req.params.id, message })
})

module.exports = {
  addMessage,
}

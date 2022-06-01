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
      $set: {
        'users.$[u].lastRead': msg,
      },
    },
    {
      arrayFilters: [{ 'u.user': mongoose.Types.ObjectId(req.user._id) }],
      new: true,
    }
  ).populate({
    path: 'users',
    populate: { path: 'user', select: '-password -friends -friendRequests' },
  })

  const message = await Message.populate(msg, [
    { path: 'user', select: '-password -friends -friendRequests' },
  ])

  const result = {
    conversationId: req.params.id,
    chatUser: conversation.users.find((chatUser) =>
      chatUser.user._id.equals(req.user._id)
    ),
    message,
  }
  // console.log(result);

  conversation.users.forEach((convUser) => {
    if (convUser.user._id.equals(req.user._id)) return
    const socket = findUserSocket(io.of('/ws').sockets, convUser.user._id)
    if (socket) {
      io.of('/ws').to(socket).emit('message', result)
    } else {
      console.warn('user not logged in')
    }
  })

  res.status(200).json(result)
})

module.exports = {
  addMessage,
}

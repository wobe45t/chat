const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')

const Message = require('../models/messageModel')

const addMessage = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')

  if (!req.body.text) {
    res.status(400)
    throw new Error('No mesasge found')
  }

  const msg = await Message.create({
    text: req.body.text,
    from: req.user.id,
    to: req.params.id,
  })

  const socket = findUserSocket(io.of('/ws').sockets, req.params.id)
  if (socket) {
    io.of('/ws').to(socket).emit('message', msg)
  }
  else{
    console.warn('user not logged in');
  }

  res.status(200).json(msg)
})

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { $and: [{ to: req.user.id }, { from: req.params.id }] },
      { $and: [{ to: req.params.id }, { from: req.user.id }] },
    ],
  })
  res.status(200).json(messages)
})

module.exports = {
  getMessages,
  addMessage,
}

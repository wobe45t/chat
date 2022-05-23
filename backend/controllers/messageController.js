const asyncHandler = require('express-async-handler')

const Message = require('../models/messageModel')

const addMessage = asyncHandler(async (req, res) => {
  const { message, from, to } = req.body
  if (!(message && from && to)) {
    res.status(400)
    throw new Error('field not present')
  }
  const msg = await Message.create({
    message,
    from,
    to,
  })
  res.status(200).json(msg)
})

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find(
    {$or: [
      {$and: [{ to: req.user.id }, { from: req.params.id }]},
      {$and: [{ to: req.params.id }, { from: req.user.id }]},
    ]}
  )
  res.status(200).json(messages)
})

module.exports = {
  getMessages
}

const mongoose = require('mongoose')

const conversationSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        read: {
          type: Boolean,
          default: true,
        },
      },
    ],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Conversation', conversationSchema)

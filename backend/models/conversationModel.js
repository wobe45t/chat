const mongoose = require('mongoose')

const conversationSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        lastRead: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message',
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

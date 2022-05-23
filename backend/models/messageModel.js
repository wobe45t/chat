const mongoose = require('mongoose')

const messageSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

messageSchema.method('toClient', function () {
  var obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  return obj
})

module.exports = mongoose.model('Message', messageSchema)

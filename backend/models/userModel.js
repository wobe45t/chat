const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    name: {
      type: String,
      required: false
    },
    surname: {
      type: String,
      required: false
    },
    friends: [this],
    friendRequests: [this]
  },
)

userSchema.method('toClient', function() {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;
    delete obj._id;

    return obj;
});

module.exports = mongoose.model('User', userSchema)

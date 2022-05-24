const mongoose = require('mongoose')

const findUserSocket = (sockets, userId) => {
  for (let [id, socket] of sockets) {
    if (socket.user.id == userId) {
      return id
    }

  }
  return null
}

module.exports = {
  findUserSocket,
}

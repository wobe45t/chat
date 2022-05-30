const chat = require('./chat')
const { Server } = require('socket.io')
const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const server = http.createServer(app)
const uuid = require('uuid')
const connectDb = require('./config/db')
const dotenv = require('dotenv').config()
const { errorHandler } = require('./middleware/errorMiddleware')
const jwt = require('jsonwebtoken')
const User = require('./models/userModel')
const Message = require('./models/messageModel')

connectDb()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/conversations', require('./routes/conversationRoutes'))
app.use('/api/friends', require('./routes/friendRoutes'))
app.use('/api/messages', require('./routes/messagesRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
app.set('socketio', io)

const users = {}

io.of('/ws').use(async (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        if (err) return next(new Error('Authentication error'))
        const user = await User.findById(decoded.id).select(
          '-password -friendRequests'
        )
        if (user) {
          socket.user = user
          next()
        } else {
          return next(new Error('Authentication error'))
        }
      }
    )
  }
})

io.of('/ws').on('connection', (socket) => {
  users[socket.user._id] = socket.id

  // EMIT USER ACTIVE TO HIS FRIENDS

  const active_friends = []
  socket.user.friends.forEach((user_id) => {
    const socket_id = users[user_id]
    if (socket_id) {
      active_friends.push(user_id)
      io.of('/ws').emit('friend-connect', { _id: socket.user._id })
    }
  })
  socket.emit('active-friends', active_friends)
  // })

  socket.on('disconnect', () => {
    delete users[socket.user._id]
    socket.user.friends.forEach((user_id) => {
      const socket_id = users[user_id]
      if (socket_id) {
        io.of('/ws').emit('friend-disconnect', { _id: socket.user._id })
      }
    })
  })
})

app.use(errorHandler)

server.listen(5000, () => {
  console.log('listening on *:5000')
})

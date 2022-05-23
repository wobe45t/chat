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

app.use('/api/messages', require('./routes/messagesRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
io.of('/ws').use(async (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        if (err) return next(new Error('Authentication error'))
        const user = await User.findById(decoded.id).select('-password')
        if (user) {
          socket.user = user.toClient()
          next()
        } else {
          return next(new Error('Authentication error'))
        }
      }
    )
  }
})

io.of('/ws').on('connection', (socket) => {
  const users = []
  const socket_id = socket.id
  for (let [id, socket] of io.of('/ws').sockets) {
    users.push({
      chatId: id,
      ...socket.user,
      active: true,
    })
  }
  socket.emit('connected', { chatId: socket.id })
  io.of('/ws').emit('users', users)

  socket.on('message', async (data) => {
    const message = await Message.create({
      text: data.text,
      from: socket.user.id,
      to: data.to,
    })
    const msg = message.toClient()

    socket.to(data.chatId).emit('message', msg)
  })

  socket.on('add-friend', async (data) => {
    console.log('add-friend: ', data)
    const find = await User.find({
      $or: [{ friendRequests: data.from }, { friends: data.from }],
    })
    if (!find) {
      await User.findByIdAndUpdate(data.to, {
        $push: { friendRequests: data.from },
      })
      socket.to(data.chatId).emit('friend-request', { from: data.from })
    } else {
      console.log('already added')
    }
  })

  socket.on('accept-friend-request', async (data) => {
    const toUser = await User.findByIdAndUpdate(
      socket.user.id,
      {
        $push: { friends: data.from },
        $pull: { friendRequests: data.from },
      },
      { new: true }
    )
    const fromUser = await User.findByIdAndUpdate(
      data.from,
      {
        $push: { friends: socket.user.id },
      },
      { new: true }
    )
    socket.emit('user', toUser)
    // socket.to('').emit('user', fromUser) //TODO need socket id here

    console.log('accept-friend-request: ', data)
  })

  socket.on('decline-friend-request', async (data) => {
    const user = await User.findByIdAndUpdate(
      socket.user.id,
      {
        $pull: { friendRequests: data.from },
      },
      { new: true }
    )
    console.log('decline-friend-reuqest: ', data)
    socket.emit('user', user)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.use(errorHandler)

server.listen(5000, () => {
  console.log('listening on *:5000')
})

const asyncHandler = require('express-async-handler')
const { findUserSocket } = require('../utils/findUserSocket')
const mongoose = require('mongoose')
const Message = require('../models/messageModel')
const Conversation = require('../models/conversationModel')

const getConversations = asyncHandler(async (req, res) => {
  const _conversations = await Conversation.aggregate([
    { $match: { 'users.user': req.user._id } },
    {
      $project: {
        users: 1,
        // users: {
        //   $filter: {
        //     input: '$users',
        //     as: 'u',
        //     cond: {
        //       $and: [{ $ne: ['$$u.user', req.user._id] }],
        //     },
        //   },
        // },
        latest: {
          $arrayElemAt: [{ $slice: ['$messages', -1] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'latest',
        foreignField: '_id',
        as: 'latest',
      },
    },
    {
      $set: { latest: { $arrayElemAt: ['$latest', 0] } },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'latest.user',
        foreignField: '_id',
        as: 'latest.user',
      },
    },
    { $unwind: { path: '$latest.user', preserveNullAndEmptyArrays: true } },
    {
      $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
        (value) => `latest.user.${value}`
      ),
    },
  ])
  const conversations = await Conversation.populate(_conversations, [
    {
      path: 'users',
      populate: { path: 'user', select: '-password -friends -friendRequests' },
    },
  ])

  res.status(200).json(conversations)
})

const markReadLatestMessage = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')

  const conversation = await Conversation.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      'users.$[u].lastRead': req.body.message_id,
    },
    {
      arrayFilters: [{ 'u.user': mongoose.Types.ObjectId(req.user._id) }],
      new: true,
    }
  ).populate({
    path: 'users',
    populate: {
      path: 'user',
      select: '-password -friends -friendRequests -email -__v',
    },
  })
  console.log('conversation after update: ', conversation)
  // const message = await Message.aggregate(
  //   [
  //     {
  //       $match: { _id: mongoose.Types.ObjectId(req.body.message_id) },
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'user',
  //         foreignField: '_id',
  //         as: 'user',
  //       },
  //     },
  //     {
  //       $unwind: '$user',
  //     },
  //     {
  //       $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
  //         (value) => `user.${value}`
  //       ),
  //     },
  //     {
  //       $lookup: {
  //         from: 'conversations',
  //         localField: '_id',
  //         foreignField: 'users.lastRead',
  //         as: 'seenBy',
  //       },
  //     },
  //     { $unwind: '$seenBy' }, //Without it filter below doesnt work
  //     {
  //       $set: {
  //         seenBy: {
  //           $map: {
  //             input: {
  //               $filter: {
  //                 input: '$seenBy.users',
  //                 as: 'u',
  //                 cond: { $eq: ['$$u.lastRead', '$_id'] },
  //               },
  //             },
  //             as: 'each',
  //             in: '$$each.user',
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         foreignField: '_id',
  //         localField: 'seenBy',
  //         as: 'seenBy',
  //       },
  //     },
  //     {
  //       $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
  //         (value) => `seenBy.${value}`
  //       ),
  //     },
  //   ],
  //   {},
  //   (err) => {
  //     console.log(err)
  //   }
  // )
  conversation.users.forEach((convUser) => {
    if (convUser.user._id.equals(req.user._id)) return
    console.log('convUser :', convUser.user._id)
    const socket = findUserSocket(io.of('/ws').sockets, convUser.user._id)
    console.log(socket)
    if (socket) {
      io.of('/ws').to(socket).emit('conversation-users-update', {
        conversation_id: conversation._id,
        users: conversation.users,
      })
    } else {
      console.warn('User not logged in')
    }
  })
  res
    .status(200)
    .json({ conversation_id: conversation._id, users: conversation.users })
})

const getConversation = asyncHandler(async (req, res) => {
  const _conversations = await Conversation.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    {
      $project: {
        messages: 1,
        users: {
          $filter: {
            input: '$users',
            as: 'users',
            cond: {
              $and: [{ $ne: ['$$users', req.user._id] }],
            },
          },
        },
        latest: {
          // $arrayElemAt: [{ $slice: ['$messages', -1] }, 0],
          $last: '$messages',
        },
      },
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'latest',
        foreignField: '_id',
        as: 'latest',
      },
    },
    {
      $set: { latest: { $arrayElemAt: ['$latest', 0] } },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'latest.user',
        foreignField: '_id',
        as: 'latest.user',
      },
    },
    { $unwind: { path: '$latest.user', preserveNullAndEmptyArrays: true } },
    {
      $unset: ['password', 'friends', 'friendRequests', 'email', '__v'].map(
        (value) => `latest.user.${value}`
      ),
    },
  ])
  const conversations = await Conversation.populate(_conversations, [
    {
      path: 'users',
      populate: { path: 'user', select: '-password -friends -friendRequests' },
    },
    {
      path: 'messages',
      populate: { path: 'user', select: '-password -friends -friendRequests' },
    },
  ])
  res.status(200).json(conversations[0])
})

const addGroupConversation = asyncHandler(async (req, res) => {
  const io = req.app.get('socketio')

  // if (!req.body.text) {
  //   res.status(400)
  //   throw new Error('No mesasge found')
  // }

  const conversation = await Conversation.create({
    name: req.body.name,
    users: req.body.users,
  })

  if (!conversation) {
    res.status(400)
    throw new Error('Coulnt create conversation')
  }

  conversation.users.forEach((user) => {
    if (user._id === req.user._id) return
    const socket = findUserSocket(io.of('/ws').sockets, user._id)
    if (socket) {
      io.of('/ws').to(socket).emit('conversation-created', conversation)
    } else {
      console.warn('User not logged in')
    }
  })

  res.status(200).json(msg)
})

module.exports = {
  getConversation,
  getConversations,
  markReadLatestMessage,
}

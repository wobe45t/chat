const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -friendRequests -friends')
  res.status(200).json(users)
})

const addUser = asyncHandler(async (req, res) => {
  const user = await User.create({
    ...req.body,
  })
  res.status(200).json(user)
})

const registerUser = asyncHandler(async (req, res) => {
  console.log('req body: ', req.body)
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  // Check if user exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user = await User.create({
    ...req.body,
    email,
    password: hashedPassword,
  })

  if (user) {
    res.status(201).json({
      _id: user.id,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user email
  const user = await User.findOne({ email }).populate([
    {
      path: 'friends',
      select: '-password -friends -friendRequests',
    },
    {
      path: 'friendRequests',
      select: '-password -friends -friendRequests',
    },
  ])

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      friends: user.friends,
      friendRequests: user.friendRequests,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc    Get user data
// @route   GET /api/users/profile
// @access  Private
// const getProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id)
//   res.status(200).json(user.profile)
// })

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}
module.exports = {
  registerUser,
  loginUser,
  getUsers,
  addUser,
}

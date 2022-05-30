const express = require('express')
const router = express.Router()
const {
  getUsers,
  registerUser,
  loginUser,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getUsers).post(registerUser)
router.post('/login', loginUser)

module.exports = router

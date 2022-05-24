const express = require('express')
const router = express.Router()
const { getMessages, addMessage } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

router.route('/:id').get(protect, getMessages).post(protect, addMessage)

module.exports = router

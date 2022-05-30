const express = require('express')
const router = express.Router()
const {
  getConversations,
  getConversation,
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getConversations)
router.route('/:id').get(protect, getConversation)

module.exports = router

const express = require('express')
const router = express.Router()
const {
  getConversations,
  getConversation,
  markReadLatestMessage,
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getConversations)
router
  .route('/:id')
  .get(protect, getConversation)
  .put(protect, markReadLatestMessage)

module.exports = router

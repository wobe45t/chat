const express = require('express')
const router = express.Router()
const {
  getConversations,
  getConversation,
  markReadLatestMessage,
  addGroupConversation
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getConversations).post(protect, addGroupConversation)
router
  .route('/:id')
  .get(protect, getConversation)
  .put(protect, markReadLatestMessage)

module.exports = router

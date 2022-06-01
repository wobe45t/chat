const express = require('express')
const router = express.Router()
const {
  getConversations,
  getConversation,
  markReadLatestMessage,
  addGroupConversation,
  leaveConversation
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getConversations).post(protect, addGroupConversation)
router
  .route('/:id')
  .get(protect, getConversation)
  .put(protect, markReadLatestMessage)
router.route('/leave/:id').put(protect, leaveConversation)

module.exports = router

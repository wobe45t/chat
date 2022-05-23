const express = require('express')
const router = express.Router()
const { getMessages } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

router.route('/:id').get(protect, getMessages)

module.exports = router

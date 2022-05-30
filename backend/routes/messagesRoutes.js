const express = require('express')
const router = express.Router()
const { addMessage } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

router.route('/:id').post(protect, addMessage)

module.exports = router

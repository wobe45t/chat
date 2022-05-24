const express = require('express')
const router = express.Router()
const {
  addFriendInvitation,
  acceptFriendInvitation,
  declineFriendInvitation
} = require('../controllers/friendController')
const { protect } = require('../middleware/authMiddleware')

router.route('/invite/:id').post(protect, addFriendInvitation)
router.route('/accept/:id').post(protect, acceptFriendInvitation)
router.route('/decline/:id').post(protect, acceptFriendInvitation)

module.exports = router

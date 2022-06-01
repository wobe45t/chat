const express = require('express')
const router = express.Router()
const {
  addFriendInvitation,
  acceptFriendInvitation,
  declineFriendInvitation,
  removeFriend
} = require('../controllers/friendController')
const { protect } = require('../middleware/authMiddleware')

router.route('/invite/:id').post(protect, addFriendInvitation)
router.route('/accept/:id').post(protect, acceptFriendInvitation)
router.route('/decline/:id').post(protect, declineFriendInvitation)
router.route('/remove/:id').post(protect, removeFriend)

module.exports = router

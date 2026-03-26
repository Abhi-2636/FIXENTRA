const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Ensure user is logged in
router.post('/', messageController.sendMessage);
router.get('/:bookingId', messageController.getMessages);

module.exports = router;

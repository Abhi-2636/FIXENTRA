const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { bookingId, text } = req.body;
        
        const message = await Message.create({
            bookingId,
            senderId: req.user._id,
            text
        });

        res.status(201).json({
            status: 'success',
            data: { message }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ bookingId: req.params.bookingId })
            .populate('senderId', 'name role')
            .sort('createdAt');

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: { messages }
        });
    } catch (err) {
        res.status(404).json({ status: 'error', message: err.message });
    }
};

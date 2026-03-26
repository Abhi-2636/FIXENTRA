const Review = require('../models/Review');

exports.createReview = async (req, res) => {
    try {
        const { providerId, rating, comment } = req.body;
        const newReview = await Review.create({
            userId: req.user._id,
            providerId,
            rating,
            comment
        });

        res.status(201).json({
            status: 'success',
            data: { review: newReview }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId })
            .populate('userId', 'name');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

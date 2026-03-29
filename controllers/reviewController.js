const { supabaseAdmin } = require('../config/supabase');

exports.createReview = async (req, res) => {
    try {
        const { providerId, rating, comment } = req.body;

        const { data: newReview, error } = await supabaseAdmin
            .from('reviews')
            .insert({
                user_id: req.user.id,
                provider_id: providerId,
                rating,
                comment
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json({
            status: 'success',
            data: { review: { ...newReview, _id: newReview.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProviderReviews = async (req, res) => {
    try {
        const { data: reviews, error } = await supabaseAdmin
            .from('reviews')
            .select(`
                *,
                user:users!reviews_user_id_fkey(id, name)
            `)
            .eq('provider_id', req.params.providerId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews: reviews.map(r => ({ ...r, _id: r.id })) }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

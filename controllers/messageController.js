const { supabaseAdmin } = require('../config/supabase');

exports.sendMessage = async (req, res) => {
    try {
        const { bookingId, text } = req.body;

        const { data: message, error } = await supabaseAdmin
            .from('messages')
            .insert({
                booking_id: bookingId,
                sender_id: req.user.id,
                text
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json({
            status: 'success',
            data: { message: { ...message, _id: message.id } }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { data: messages, error } = await supabaseAdmin
            .from('messages')
            .select(`
                *,
                sender:users!messages_sender_id_fkey(id, name, role)
            `)
            .eq('booking_id', req.params.bookingId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: { messages: messages.map(m => ({ ...m, _id: m.id })) }
        });
    } catch (err) {
        res.status(404).json({ status: 'error', message: err.message });
    }
};

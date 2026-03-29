const { supabaseAdmin } = require('../config/supabase');
const { getPublicProviders, scoreProviderForAssignment } = require('../utils/catalog');

// Create a booking
exports.createBooking = async (req, res) => {
    try {
        const {
            serviceId, providerId, address, date, timeSlot,
            paymentMethod, couponCode, locality, priorityType,
            issueNote, issuePhotoName, familyProfile, addressLabel
        } = req.body;

        // Get service
        const { data: service, error: sErr } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (sErr || !service) return res.status(404).json({ message: 'Service not found.' });

        let amount = Number(service.price);
        let discount = 0;
        const normalizedPriority = priorityType === 'emergency' ? 'emergency' : 'standard';

        // Validate coupon
        if (couponCode) {
            const { data: coupon } = await supabaseAdmin
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .single();

            if (coupon && coupon.is_active && coupon.used_count < coupon.max_uses && new Date() < new Date(coupon.expires_at)) {
                discount = coupon.discount;
                amount = amount - (amount * (discount / 100));
                await supabaseAdmin.from('coupons')
                    .update({ used_count: coupon.used_count + 1 })
                    .eq('id', coupon.id);
            }
        }

        if (normalizedPriority === 'emergency') {
            amount = amount + (amount * 0.5);
        }
        amount = Math.round(amount);

        let selectedProviderId = providerId || null;
        let bookingStatus = 'pending';
        let matchedProviders = [];

        if (selectedProviderId) {
            // Check if provider already booked for this slot
            const { data: existing } = await supabaseAdmin
                .from('bookings')
                .select('id')
                .eq('provider_id', selectedProviderId)
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .not('status', 'in', '("cancelled","rejected")')
                .limit(1);

            if (existing && existing.length > 0) {
                return res.status(400).json({ message: 'The provider is already booked for this time slot.' });
            }
            bookingStatus = 'assigned';
        } else {
            matchedProviders = await getPublicProviders({
                category: service.category,
                locality: locality || 'Patna',
                date,
                timeSlot
            });
            const bestProvider = [...matchedProviders]
                .filter(p => p.availabilityStatus !== 'slot-booked')
                .sort((a, b) => scoreProviderForAssignment(b) - scoreProviderForAssignment(a))[0];
            if (bestProvider) {
                selectedProviderId = bestProvider.id || bestProvider._id;
                bookingStatus = 'assigned';
            }
        }

        const { data: newBooking, error } = await supabaseAdmin
            .from('bookings')
            .insert({
                user_id: req.user.id,
                service_id: serviceId,
                provider_id: selectedProviderId,
                address,
                locality: locality || 'Patna',
                address_label: addressLabel || null,
                family_profile: familyProfile || null,
                issue_note: issueNote || null,
                issue_photo_name: req.file?.originalname || issuePhotoName || null,
                issue_photo_url: req.file ? `uploads/issues/${req.file.filename}` : null,
                estimated_arrival_mins: matchedProviders[0]?.estimatedArrivalMins || service.base_eta || 28,
                matched_provider_count: matchedProviders.length,
                priority_type: normalizedPriority,
                status: bookingStatus,
                date,
                time_slot: timeSlot,
                payment_method: paymentMethod || 'cash',
                amount,
                discount,
                coupon_code: couponCode ? couponCode.toUpperCase() : null
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        console.log(`\n\n✅ [WHATSAPP API MOCK] Message dispatched to ${req.user.phone || 'customer'}`);
        console.log(`"Fixentra: Booking Confirmed! 🚀 Your expert will arrive at ${timeSlot} on ${new Date(date).toDateString()}. Team Patna."\n\n`);

        res.status(201).json({
            status: 'success',
            data: { booking: { ...newBooking, _id: newBooking.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// View assigned jobs for providers
exports.getProviderJobs = async (req, res) => {
    try {
        const { data: jobs, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                user:users!bookings_user_id_fkey(id, name, phone, email),
                service:services(id, name, category, price, photo, gallery, included)
            `)
            .eq('provider_id', req.user.id);

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: jobs.length,
            data: { jobs: jobs.map(j => ({ ...j, _id: j.id })) }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Update job status (Provider)
exports.updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({ status })
            .eq('id', req.params.id)
            .eq('provider_id', req.user.id)
            .select()
            .single();

        if (error || !booking) {
            return res.status(404).json({ message: 'No booking found for this provider.' });
        }

        if (status === 'completed') {
            // Increment completed jobs
            const { data: provider } = await supabaseAdmin
                .from('users')
                .select('completed_jobs')
                .eq('id', req.user.id)
                .single();

            await supabaseAdmin.from('users')
                .update({ completed_jobs: (provider?.completed_jobs || 0) + 1 })
                .eq('id', req.user.id);
        }

        res.status(200).json({
            status: 'success',
            data: { booking: { ...booking, _id: booking.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// View booking history for users
exports.getUserHistory = async (req, res) => {
    try {
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                service:services(id, name, category, price, photo, gallery, included),
                provider:users!bookings_provider_id_fkey(id, name, phone, profile_image, skills, working_localities, response_time_mins)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings: bookings.map(b => ({ ...b, _id: b.id })) }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Admin: View all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                user:users!bookings_user_id_fkey(id, name, email, address),
                service:services(id, name, category, price, photo, gallery, included),
                provider:users!bookings_provider_id_fkey(id, name, phone, profile_image, skills, working_localities, response_time_mins)
            `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: { bookings: bookings.map(b => ({ ...b, _id: b.id })) }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// Admin: Assign provider to booking
exports.assignProvider = async (req, res) => {
    try {
        const { providerId } = req.body;

        const { data: existingBooking, error: bErr } = await supabaseAdmin
            .from('bookings')
            .select('*, service:services(category)')
            .eq('id', req.params.id)
            .single();

        if (bErr || !existingBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Check for conflicts
        const { data: conflicts } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .neq('id', existingBooking.id)
            .eq('provider_id', providerId)
            .eq('date', existingBooking.date)
            .eq('time_slot', existingBooking.time_slot)
            .in('status', ['pending', 'assigned', 'accepted'])
            .limit(1);

        if (conflicts && conflicts.length > 0) {
            return res.status(400).json({ message: 'Selected provider is already assigned for this time slot.' });
        }

        const providerOptions = await getPublicProviders({
            category: existingBooking.service?.category,
            locality: existingBooking.locality,
            date: existingBooking.date,
            timeSlot: existingBooking.time_slot
        });
        const matchedProvider = providerOptions.find(p => String(p.id || p._id) === String(providerId));

        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({
                provider_id: providerId,
                status: 'assigned',
                estimated_arrival_mins: matchedProvider?.estimatedArrivalMins || existingBooking.estimated_arrival_mins
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            data: { booking: { ...booking, _id: booking.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Cancel a booking (User)
exports.cancelBooking = async (req, res) => {
    try {
        const { data: booking, error: fErr } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (fErr || !booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized.' });
        }
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'This booking cannot be cancelled.' });
        }

        const { data: updated, error } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            data: { booking: { ...updated, _id: updated.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

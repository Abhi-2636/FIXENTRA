const { supabaseAdmin } = require('../config/supabase');
const { enrichServices } = require('../utils/catalog');

function parseListField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_err) {
        return String(value).split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
}

exports.getAllServices = async (req, res) => {
    try {
        const { data: services, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        const enrichedServices = await enrichServices(services, {
            locality: req.query.locality || ''
        });

        res.status(200).json({
            status: 'success',
            results: enrichedServices.length,
            data: { services: enrichedServices }
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const galleryFiles = req.files?.gallery || [];
        const primaryPhoto = req.files?.photo?.[0];
        const payload = {
            name: req.body.name,
            category: req.body.category,
            price: Number(req.body.price),
            description: req.body.description || null,
            included: parseListField(req.body.included),
            gallery: galleryFiles.map(file => `uploads/services/${file.filename}`),
            duration_mins: Number(req.body.durationMins) || 60,
            base_eta: Number(req.body.baseEta) || 28,
            rating: Number(req.body.rating) || 4.8
        };
        if (primaryPhoto) {
            payload.photo = `uploads/services/${primaryPhoto.filename}`;
        }

        const { data: newService, error } = await supabaseAdmin
            .from('services')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json({
            status: 'success',
            data: { service: { ...newService, _id: newService.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { data: existingService, error: fErr } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fErr || !existingService) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        const galleryFiles = req.files?.gallery || [];
        const primaryPhoto = req.files?.photo?.[0];
        const payload = {};

        if (req.body.name) payload.name = req.body.name;
        if (req.body.category) payload.category = req.body.category;
        if (req.body.price) payload.price = Number(req.body.price);
        if (req.body.description) payload.description = req.body.description;
        if (req.body.included) payload.included = parseListField(req.body.included);
        if (galleryFiles.length) {
            payload.gallery = [...existingService.gallery, ...galleryFiles.map(f => `uploads/services/${f.filename}`)].slice(0, 8);
        }
        if (primaryPhoto) {
            payload.photo = `uploads/services/${primaryPhoto.filename}`;
        }

        const { data: service, error } = await supabaseAdmin
            .from('services')
            .update(payload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(200).json({
            status: 'success',
            data: { service: { ...service, _id: service.id } }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('services')
            .delete()
            .eq('id', req.params.id);

        if (error) throw new Error(error.message);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

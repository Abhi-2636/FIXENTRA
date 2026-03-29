const { supabaseAdmin } = require('../config/supabase');

const CATEGORY_KEYWORDS = {
    maid: ['maid', 'house help', 'domestic help'],
    electrician: ['electrician', 'electrical', 'wiring', 'switchboard', 'fan'],
    plumber: ['plumber', 'plumbing', 'leak', 'pipe', 'tap', 'bathroom'],
    'appliance repair': ['appliance', 'repair', 'ac', 'ro', 'washing machine', 'cooler', 'microwave'],
    cleaning: ['cleaning', 'deep clean', 'sanitization', 'sofa', 'kitchen'],
    carpenter: ['carpenter', 'furniture', 'woodwork', 'assembly'],
    painter: ['painter', 'paint', 'wall'],
    'pest control': ['pest', 'termite', 'cockroach', 'rodent']
};

const DEFAULT_PROVIDER_IMAGES = {
    electrician: '/expert-electrician.svg',
    plumber: '/expert-plumber.svg',
    'appliance repair': '/expert-appliance.svg',
    cleaning: '/expert-cleaner.svg',
    carpenter: '/expert-electrician.svg',
    painter: '/expert-cleaner.svg',
    'pest control': '/expert-appliance.svg',
    maid: '/expert-cleaner.svg',
    default: '/expert-electrician.svg'
};

const DEFAULT_SERVICE_MEDIA = {
    electrician: { primary: '/expert-electrician.svg', gallery: ['/expert-electrician.svg', '/hero.png'] },
    plumber: { primary: '/expert-plumber.svg', gallery: ['/expert-plumber.svg', '/hero.png'] },
    'appliance repair': { primary: '/expert-appliance.svg', gallery: ['/expert-appliance.svg', '/hero.png'] },
    cleaning: { primary: '/expert-cleaner.svg', gallery: ['/expert-cleaner.svg', '/hero.png'] },
    carpenter: { primary: '/hero.png', gallery: ['/hero.png', '/expert-electrician.svg'] },
    painter: { primary: '/hero.png', gallery: ['/hero.png', '/expert-cleaner.svg'] },
    'pest control': { primary: '/hero.png', gallery: ['/hero.png', '/expert-appliance.svg'] },
    maid: { primary: '/expert-cleaner.svg', gallery: ['/expert-cleaner.svg', '/hero.png'] },
    default: { primary: '/hero.png', gallery: ['/hero.png'] }
};

const DEFAULT_INCLUDED = {
    electrician: ['Visit charge included', 'Safety check', 'Transparent material recommendation'],
    plumber: ['Leak inspection', 'Basic fittings check', 'Work summary after visit'],
    'appliance repair': ['Diagnosis visit', 'Part recommendation', 'Service summary'],
    cleaning: ['Trained crew', 'Checklist-based execution', 'Before/after photo confirmation'],
    carpenter: ['Tool-ready visit', 'Minor alignment checks', 'Transparent labor pricing'],
    painter: ['Surface inspection', 'Coverage estimate', 'Clean-finish workflow'],
    'pest control': ['Apartment-safe treatment', 'Service notes', 'Follow-up guidance'],
    maid: ['Background-verified staff', 'Task checklist', 'Transparent booking notes'],
    default: ['Verified professional', 'Support tracking', 'Transparent booking summary']
};

function normalizeAssetPath(value) {
    if (!value) return null;
    const normalized = String(value).replace(/\\/g, '/');
    if (/^https?:\/\//.test(normalized) || normalized.startsWith('/')) {
        return normalized;
    }
    return `/${normalized}`;
}

function getKeywords(category) {
    return CATEGORY_KEYWORDS[String(category || '').toLowerCase()] || [String(category || '').toLowerCase()];
}

function providerMatchesCategory(provider, category) {
    if (!category) return true;
    const keywords = getKeywords(category);
    const skillText = [
        ...(provider.skills || []),
        provider.role,
        provider.address,
        ...(provider.working_localities || provider.workingLocalities || [])
    ].filter(Boolean).join(' ').toLowerCase();

    if (!skillText.trim()) return true;
    return keywords.some(keyword => skillText.includes(keyword));
}

function providerMatchesLocality(provider, locality) {
    if (!locality) return false;
    const haystack = [
        provider.address,
        ...(provider.working_localities || provider.workingLocalities || [])
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(String(locality).toLowerCase());
}

function resolveProviderImage(provider, category = '') {
    const img = provider.profile_image || provider.profileImage;
    if (img && img !== 'default.png') {
        return normalizeAssetPath(img);
    }
    const inferredCategory = Object.keys(CATEGORY_KEYWORDS).find(item => providerMatchesCategory(provider, item)) || category;
    return DEFAULT_PROVIDER_IMAGES[inferredCategory] || DEFAULT_PROVIDER_IMAGES.default;
}

function getServiceMedia(category, explicitPhoto, explicitGallery = []) {
    const defaults = DEFAULT_SERVICE_MEDIA[category] || DEFAULT_SERVICE_MEDIA.default;
    const primary = normalizeAssetPath(explicitPhoto) || defaults.primary;
    const gallery = explicitGallery.map(normalizeAssetPath).filter(Boolean);
    return {
        photoUrl: primary,
        galleryUrls: [...new Set([primary, ...gallery, ...(defaults.gallery || [])].filter(Boolean))].slice(0, 6)
    };
}

function getDefaultIncluded(category) {
    return DEFAULT_INCLUDED[category] || DEFAULT_INCLUDED.default;
}

async function getProviderAvailabilitySnapshot(options = {}) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Get active bookings count per provider today
    const { data: activeRows } = await supabaseAdmin
        .from('bookings')
        .select('provider_id')
        .not('provider_id', 'is', null)
        .in('status', ['pending', 'assigned', 'accepted'])
        .gte('date', startOfDay.toISOString().split('T')[0])
        .lte('date', endOfDay.toISOString().split('T')[0]);

    // Count per provider
    const activeMap = new Map();
    (activeRows || []).forEach(row => {
        const pid = String(row.provider_id);
        activeMap.set(pid, (activeMap.get(pid) || 0) + 1);
    });

    let occupiedSet = new Set();
    if (options.date && options.timeSlot) {
        const dateStr = new Date(options.date).toISOString().split('T')[0];
        const { data: occupiedRows } = await supabaseAdmin
            .from('bookings')
            .select('provider_id')
            .not('provider_id', 'is', null)
            .in('status', ['pending', 'assigned', 'accepted'])
            .eq('date', dateStr)
            .eq('time_slot', options.timeSlot);

        occupiedSet = new Set((occupiedRows || []).map(row => String(row.provider_id)));
    }

    return { activeMap, occupiedSet };
}

async function getPublicProviders(options = {}) {
    const { data: providers, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, phone, address, skills, experience, rating, completed_jobs, latitude, longitude, working_localities, response_time_mins, profile_image, role')
        .eq('role', 'provider');

    if (error || !providers) return [];

    const snapshot = await getProviderAvailabilitySnapshot(options);

    return providers
        .map(provider => {
            const activeJobs = snapshot.activeMap.get(String(provider.id)) || 0;
            const localityMatch = providerMatchesLocality(provider, options.locality);
            const matchesCategory = providerMatchesCategory(provider, options.category);
            const slotBooked = options.date && options.timeSlot ? snapshot.occupiedSet.has(String(provider.id)) : false;
            const baseEta = provider.response_time_mins || 18;
            const estimatedArrivalMins = Math.max(
                12,
                Math.round(baseEta + (activeJobs * 7) - (localityMatch ? 4 : 0) - (((provider.rating || 4.5) - 4) * 2))
            );

            return {
                ...provider,
                _id: provider.id,
                profileImage: resolveProviderImage(provider, options.category),
                completedJobs: provider.completed_jobs,
                responseTimeMins: provider.response_time_mins,
                workingLocalities: provider.working_localities,
                activeJobs,
                localityMatch,
                matchesCategory,
                estimatedArrivalMins,
                availabilityStatus: slotBooked ? 'slot-booked' : activeJobs < 2 ? 'available' : activeJobs < 4 ? 'busy' : 'limited'
            };
        })
        .filter(provider => !options.category || provider.matchesCategory);
}

function scoreProviderForAssignment(provider) {
    let score = (provider.rating || 4.5) * 10 + (provider.completedJobs || provider.completed_jobs || 0);
    if (provider.matchesCategory) score += 35;
    if (provider.localityMatch) score += 18;
    if (provider.availabilityStatus === 'available') score += 18;
    if (provider.availabilityStatus === 'busy') score += 8;
    if (provider.availabilityStatus === 'slot-booked') score -= 200;
    score -= provider.activeJobs * 5;
    score -= Math.round((provider.estimatedArrivalMins || 20) / 2);
    return score;
}

async function enrichServices(services, options = {}) {
    const providers = await getPublicProviders({});

    return services.map(service => {
        const svc = service.toObject ? service.toObject() : service;
        const matchingProviders = providers.filter(p => providerMatchesCategory(p, svc.category));
        const availableProviders = matchingProviders.filter(p => p.availabilityStatus !== 'slot-booked');
        const media = getServiceMedia(svc.category, svc.photo, svc.gallery || []);
        const etaValues = availableProviders.map(p => p.estimatedArrivalMins).filter(Boolean);
        const availability = {
            activeExperts: availableProviders.length,
            etaMins: etaValues.length ? Math.round(etaValues.reduce((sum, v) => sum + v, 0) / etaValues.length) : (svc.base_eta || svc.baseEta || 28),
            jobsToday: availableProviders.reduce((sum, p) => sum + p.activeJobs, 0),
            topLocality: options.locality || matchingProviders.find(p => (p.working_localities || p.workingLocalities || []).length)?.working_localities?.[0] || 'Patna'
        };

        return {
            ...svc,
            _id: svc.id,
            ...media,
            galleryUrls: media.galleryUrls,
            included: Array.isArray(svc.included) && svc.included.length ? svc.included : getDefaultIncluded(svc.category),
            durationMins: svc.duration_mins || svc.durationMins,
            baseEta: svc.base_eta || svc.baseEta,
            availability
        };
    });
}

module.exports = {
    normalizeAssetPath,
    providerMatchesCategory,
    providerMatchesLocality,
    resolveProviderImage,
    getServiceMedia,
    getDefaultIncluded,
    getPublicProviders,
    scoreProviderForAssignment,
    enrichServices
};

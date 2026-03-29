// ===== FIXENTRA ULTRA PREMIUM APP =====
// State
let user = JSON.parse(localStorage.getItem('fixentra_user')) || null;
let token = localStorage.getItem('fixentra_token') || null;
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8080' : 'https://fixentra.onrender.com';

let GOOGLE_CLIENT_ID = ''; // Will be hydrated from backend automatically
let allServices = [];
let currentCarouselSlide = 0;

const appContainer = document.getElementById('app-container');
const authBtns = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
let activeBookingServiceName = '';
let activeBookingBasePrice = 0;
let bookingStep = 1;
let registerStep = 1;
let bookingMode = 'standard';
let bookingIssuePhotoName = '';
let preferredLocality = '';
let providerDirectory = [];
let publicProviderCatalog = [];
let publicProviderCatalogLoaded = false;
let activeRoute = '';

const localityInsights = [
    { name: 'Boring Road', eta: 18, experts: 14, jobsToday: 27, rating: '4.9', savings: '18%', coverage: 'Premium apartments & quick response' },
    { name: 'Kankarbagh', eta: 22, experts: 19, jobsToday: 35, rating: '4.8', savings: '15%', coverage: 'Largest active expert pool right now' },
    { name: 'Rajendra Nagar', eta: 24, experts: 11, jobsToday: 16, rating: '4.8', savings: '14%', coverage: 'Fast plumbing and electrical slots' },
    { name: 'Patliputra Colony', eta: 20, experts: 9, jobsToday: 13, rating: '4.9', savings: '17%', coverage: 'High repeat booking rate this week' },
    { name: 'Bailey Road', eta: 26, experts: 8, jobsToday: 12, rating: '4.7', savings: '13%', coverage: 'Best for appliance and AC jobs' },
    { name: 'Danapur', eta: 28, experts: 10, jobsToday: 18, rating: '4.8', savings: '16%', coverage: 'Growing coverage with same-day support' }
];

const featuredExperts = [
    {
        id: 'suresh-kumar',
        name: 'Suresh Kumar',
        role: 'Senior Electrician',
        emoji: '👨‍🔧',
        image: 'expert-electrician.svg',
        rating: '4.9',
        jobs: '128',
        eta: '16 mins',
        area: 'Boring Road',
        languages: 'Hindi, Bhojpuri',
        badges: ['Police Verified', 'Top 1%'],
        bio: 'Specializes in switchboards, inverter wiring, fan installs, and same-day diagnostics for apartment homes.',
        highlights: ['98% on-time arrival', '30-day rework guarantee', 'Weekend emergency coverage'],
        services: ['Wiring repair', 'Appliance install', 'Power backup setup']
    },
    {
        id: 'rahul-verma',
        name: 'Rahul Verma',
        role: 'Deep Cleaning Lead',
        emoji: '🧹',
        image: 'expert-cleaner.svg',
        rating: '5.0',
        jobs: '240',
        eta: '22 mins',
        area: 'Patliputra Colony',
        languages: 'Hindi, English',
        badges: ['Elite Clean Team', '5-Star Streak'],
        bio: 'Handles premium apartment cleaning, post-party resets, and sofa plus kitchen restoration packages.',
        highlights: ['240+ completed jobs', 'Kid-safe supplies', 'Photo checklist after service'],
        services: ['Deep cleaning', 'Kitchen reset', 'Move-in cleaning']
    },
    {
        id: 'priya-kumari',
        name: 'Priya Kumari',
        role: 'Appliance Guard',
        emoji: '👩‍🔧',
        image: 'expert-appliance.svg',
        rating: '4.8',
        jobs: '76',
        eta: '24 mins',
        area: 'Rajendra Nagar',
        languages: 'Hindi, English',
        badges: ['Women Preferred', 'Fast Response'],
        bio: 'Trusted for AC tune-ups, RO servicing, and appliance troubleshooting with transparent part recommendations.',
        highlights: ['Part estimate before work', 'Great for senior citizen homes', 'Video-call diagnostics available'],
        services: ['AC service', 'RO service', 'Appliance diagnostics']
    },
    {
        id: 'aman-singh',
        name: 'Aman Singh',
        role: 'Master Plumber',
        emoji: '🔧',
        image: 'expert-plumber.svg',
        rating: '4.8',
        jobs: '92',
        eta: '19 mins',
        area: 'Kankarbagh',
        languages: 'Hindi, Bhojpuri',
        badges: ['Leak Rescue', 'Emergency Ready'],
        bio: 'Best for leak fixes, tank issues, bathroom fittings, and urgent water line visits across East Patna.',
        highlights: ['Emergency slots daily', 'Transparent visit fee', 'Quick material checklist'],
        services: ['Leak repair', 'Bathroom fittings', 'Water line fix']
    }
];

const subscriptionPlans = [
    {
        name: 'Home Care Lite',
        price: '₹499/mo',
        subtitle: 'For repeat maintenance homes',
        perks: ['Quarterly inspection visit', 'Priority callback within 10 mins', 'Exclusive member-only pricing'],
        accent: 'var(--primary)'
    },
    {
        name: 'Family Shield',
        price: '₹999/mo',
        subtitle: 'Best for parents and multi-home families',
        perks: ['2 saved homes included', 'Emergency booking queue jump', 'Dedicated support on WhatsApp'],
        accent: 'var(--secondary)'
    },
    {
        name: 'Society Pro',
        price: 'Custom',
        subtitle: 'For apartments and offices',
        perks: ['Bulk job dashboard', 'Shared invoice cycle', 'On-site inspection and SLA'],
        accent: 'var(--accent)'
    }
];

const attractionFeatures = [
    {
        title: 'Instant Local Availability',
        desc: 'See ETA, active experts, and local demand before you book.',
        icon: '📍'
    },
    {
        title: 'Photo-Based Diagnosis',
        desc: 'Upload a leak, switchboard, or appliance issue and get matched faster.',
        icon: '📸'
    },
    {
        title: 'Saved Homes & Family Profiles',
        desc: 'Book for home, office, or parents without re-entering details every time.',
        icon: '🏠'
    },
    {
        title: 'Plans That Bring You Back',
        desc: 'Subscriptions, referrals, and loyalty points keep repeat users engaged.',
        icon: '🎁'
    }
];

const defaultSavedAddresses = [
    { id: 'home-main', label: 'Main Home', locality: 'Boring Road', address: 'Flat 302, Shanti Residency, Near Atal Path' },
    { id: 'parents-home', label: 'Parents Home', locality: 'Kankarbagh', address: 'House 14B, PC Colony, Sector 2' }
];

const defaultFamilyProfiles = [
    { id: 'self', label: 'For Me', phoneHint: 'Primary account contact' },
    { id: 'parents', label: 'Parents', phoneHint: 'For family support visits' },
    { id: 'tenant', label: 'Tenant / Caretaker', phoneHint: 'Good for rental properties' }
];

function readStoredJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
        return fallback;
    }
}

function writeStoredJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function toTitleCase(value) {
    return String(value || '')
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function normalizeImageSrc(path) {
    if (!path) return '';
    const normalized = String(path).replace(/\\/g, '/');
    if (/^(https?:)?\/\//.test(normalized)) return normalized;
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

let savedAddresses = readStoredJSON('fixentra_saved_addresses', defaultSavedAddresses);
let familyProfiles = readStoredJSON('fixentra_family_profiles', defaultFamilyProfiles);
let newsletterSubscribers = readStoredJSON('fixentra_newsletter_subscribers', []);
let savedCorporateLeads = readStoredJSON('fixentra_corporate_leads', []);
let savedPlanInterests = readStoredJSON('fixentra_plan_interest', []);

const infoPages = {
    about: {
        title: 'About Fixentra',
        kicker: 'ABOUT FIXENTRA',
        intro: 'Fixentra is designed for people who want premium home service booking without the uncertainty of random neighborhood vendors. The product focuses on speed, trust, and repeat convenience for Patna households.',
        stats: [
            { value: '8+', label: 'Patna localities covered' },
            { value: '50+', label: 'Verified service professionals' },
            { value: '30-day', label: 'Rework guarantee promise' }
        ],
        highlights: [
            'Transparent pricing before confirmation',
            'Verified experts with stronger profile depth',
            'Saved homes, family booking, and repeat flows'
        ],
        sections: [
            {
                title: 'What we solve',
                body: 'Booking a plumber, electrician, cleaner, or appliance expert should not depend on random calls and uncertain price negotiation. Fixentra turns that into a structured, screen-friendly experience.'
            },
            {
                title: 'How the platform works',
                body: 'Users choose a locality, describe the issue, compare pricing, and book from a guided flow with ETA context, issue notes, saved addresses, and payment visibility.'
            },
            {
                title: 'Why customers come back',
                body: 'Repeat trust matters more than flashy marketing. That is why the product includes loyalty, memberships, expert profiles, and booking shortcuts for families and multi-home users.'
            }
        ],
        ctaLabel: 'Explore Services',
        ctaView: 'services'
    },
    careers: {
        title: 'Careers',
        kicker: 'CAREERS',
        intro: 'We are building a stronger home-services experience for Patna and future city expansion. We hire people who care about operations quality, trustworthy service delivery, and customer experience that actually works.',
        stats: [
            { value: '4', label: 'Core teams hiring' },
            { value: '3', label: 'Interview stages' },
            { value: 'Hybrid', label: 'Work style by role' }
        ],
        highlights: [
            'Operations and city growth',
            'Customer success and support',
            'Provider onboarding and quality control'
        ],
        sections: [
            {
                title: 'Current focus roles',
                body: 'We are most interested in operations managers, provider-success associates, customer support leads, and growth generalists who can execute with limited hand-holding.'
            },
            {
                title: 'What working here feels like',
                body: 'This is a service business with product thinking. The work is practical, fast-moving, and measurable. We value people who can simplify messy real-world problems.'
            },
            {
                title: 'How to apply',
                body: 'Send your profile and a short note about which function you want to own. Strong applications usually show evidence of execution, ownership, and comfort with customer-facing operations.'
            }
        ],
        ctaLabel: 'Contact Us',
        ctaView: 'corporate'
    },
    terms: {
        title: 'Terms & Conditions',
        kicker: 'TERMS & CONDITIONS',
        intro: 'These terms define the practical rules around booking, pricing, cancellations, payments, and service delivery on Fixentra.',
        stats: [
            { value: 'Standard', label: 'Visits available citywide' },
            { value: '50%', label: 'Emergency priority surcharge' },
            { value: '30-day', label: 'Eligible rework window' }
        ],
        highlights: [
            'Bookings depend on locality coverage and expert availability',
            'Emergency slots may carry higher pricing than standard visits',
            'Rework applies only to supported service categories and scopes'
        ],
        sections: [
            {
                title: 'Booking scope',
                body: 'A booking confirms the selected service category, locality, date, and time slot. Final scope can still depend on on-site inspection for hidden damage or additional material requirements.'
            },
            {
                title: 'Pricing and payment',
                body: 'Fixentra shows pricing before confirmation whenever possible. Final amounts can change only if the requested work expands beyond the original problem statement or material requirement.'
            },
            {
                title: 'Cancellation and rescheduling',
                body: 'Users can cancel eligible bookings before completion. Repeated last-minute cancellations or misuse of emergency booking may result in account restrictions.'
            },
            {
                title: 'Service quality promise',
                body: 'The 30-day rework guarantee applies to supported service types and only to the specific work delivered through the booking. It does not cover unrelated future issues or external damage.'
            }
        ],
        ctaLabel: 'Book a Service',
        ctaView: 'services'
    },
    privacy: {
        title: 'Privacy Policy',
        kicker: 'PRIVACY POLICY',
        intro: 'Fixentra collects only the information needed to support booking, communication, payments, and repeat customer convenience.',
        stats: [
            { value: 'Profile', label: 'Name, phone, address' },
            { value: 'Booking', label: 'Service and issue metadata' },
            { value: 'Support', label: 'Chat and payment context' }
        ],
        highlights: [
            'We use saved addresses and family profiles to reduce repeat booking friction',
            'Issue notes and photo names help experts prepare before arrival',
            'Payment and communication events are kept for support and auditing'
        ],
        sections: [
            {
                title: 'What we collect',
                body: 'Account details, addresses, booking preferences, service history, issue descriptions, payment method choices, and communication metadata may be stored to run the platform.'
            },
            {
                title: 'How we use the data',
                body: 'The data is used to confirm bookings, match experts, support customer service, improve repeat flows, and maintain booking records for operational quality and trust.'
            },
            {
                title: 'What we do not claim',
                body: 'We do not present unnecessary personal data publicly. Sensitive payment processing is handled through the configured payment flow rather than exposed in the front-end application.'
            },
            {
                title: 'User control',
                body: 'Users can update core profile details from account settings. Additional deletion or policy requests should be sent through the official support channel.'
            }
        ],
        ctaLabel: 'Open Settings',
        ctaView: 'dashboard'
    }
};

function mapProviderToExpert(provider) {
    const skillLabel = provider.skills?.[0] ? toTitleCase(provider.skills[0]) : 'Home Service Expert';
    const workingArea = provider.workingLocalities?.[0] || provider.address?.split(',')[0] || 'Patna';
    return {
        id: provider._id,
        name: provider.name,
        role: skillLabel,
        emoji: '👷',
        image: provider.profileImage || 'expert-electrician.svg',
        rating: String(provider.rating || 4.7),
        jobs: String(provider.completedJobs || 0),
        eta: `${provider.estimatedArrivalMins || provider.responseTimeMins || 18} mins`,
        area: workingArea,
        languages: 'Hindi, English',
        badges: [
            provider.availabilityStatus === 'available' ? 'Available Now' : 'Verified Provider',
            `${provider.experience || 0}+ yrs experience`
        ],
        bio: provider.skills?.length
            ? `Available for ${provider.skills.map(skill => toTitleCase(skill)).join(', ')} bookings with stronger locality-based assignment.`
            : 'Verified Fixentra service professional available for scheduled and priority visits.',
        highlights: [
            `${provider.completedJobs || 0}+ completed jobs`,
            `${provider.estimatedArrivalMins || provider.responseTimeMins || 18} min response estimate`,
            provider.workingLocalities?.length ? `Covers ${provider.workingLocalities.join(', ')}` : 'Patna city coverage'
        ],
        services: provider.skills?.length ? provider.skills.map(skill => toTitleCase(skill)) : ['General Home Services']
    };
}

function getFeaturedExpertsData() {
    if (publicProviderCatalog.length) {
        return [...publicProviderCatalog]
            .sort((a, b) => {
                const availabilityScore = { available: 3, busy: 2, limited: 1, 'slot-booked': 0 };
                return (availabilityScore[b.availabilityStatus] || 0) - (availabilityScore[a.availabilityStatus] || 0)
                    || (b.rating || 0) - (a.rating || 0)
                    || (b.completedJobs || 0) - (a.completedJobs || 0);
            })
            .slice(0, 6)
            .map(mapProviderToExpert);
    }
    return featuredExperts;
}

function getServicePrimaryImage(service = {}) {
    const fallbackExpert = featuredExperts.find(item => getExpertCategory(item) === String(service.category || '').toLowerCase());
    return normalizeImageSrc(service.photoUrl || service.photo || fallbackExpert?.image || 'hero.png');
}

function getServiceGallery(service = {}) {
    const gallerySources = Array.isArray(service.galleryUrls) && service.galleryUrls.length
        ? service.galleryUrls
        : Array.isArray(service.gallery)
            ? service.gallery
            : [];
    const images = [service.photoUrl, service.photo, ...gallerySources]
        .map(normalizeImageSrc)
        .filter(Boolean);
    if (!images.length) {
        images.push(getServicePrimaryImage(service));
    }
    return [...new Set(images)].slice(0, 6);
}

function getServiceIncluded(service = {}) {
    if (Array.isArray(service.included) && service.included.length) {
        return service.included;
    }
    return ['Verified professional', 'Transparent pricing', '30-day rework support'];
}

function getServiceAvailability(service = {}, fallbackIndex = 0) {
    const fallback = localityInsights[fallbackIndex % localityInsights.length];
    const availability = service.availability || {};
    return {
        etaMins: availability.etaMins || fallback.eta,
        activeExperts: availability.activeExperts ?? fallback.experts,
        jobsToday: availability.jobsToday ?? fallback.jobsToday,
        topLocality: preferredLocality || availability.topLocality || fallback.name
    };
}

function getExpertForService(service, fallbackIndex = 0) {
    const experts = getFeaturedExpertsData();
    const category = String(service?.category || '').toLowerCase();
    const matchedExpert = experts.find(expert => {
        const expertCategory = getExpertCategory(expert);
        const expertText = `${expert.role || ''} ${(expert.services || []).join(' ')}`.toLowerCase();
        return category && (expertCategory === category || expertText.includes(category));
    });
    return matchedExpert || experts[fallbackIndex % experts.length] || featuredExperts[0];
}

function persistUserState() {
    if (user) {
        localStorage.setItem('fixentra_user', JSON.stringify(user));
    }
}

function ensureUserProfileDefaults() {
    if (!user) return;
    if (typeof user.walletBalance !== 'number') user.walletBalance = 0;
    if (!user.referralCode) {
        const seed = (user.name || 'FIX').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'FIXP';
        user.referralCode = `${seed}${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!user.loyaltyPoints) user.loyaltyPoints = 240;
    if (!user.loyaltyTier) user.loyaltyTier = 'Priority Gold';
    if (!user.loyaltyStreak) user.loyaltyStreak = 6;
    if (!user.subscriptionPlan) user.subscriptionPlan = 'Family Shield';
    if (user.address && !savedAddresses.some(item => item.address === user.address)) {
        savedAddresses = [
            { id: `saved-${Date.now()}`, label: 'Primary Address', locality: 'Patna', address: user.address },
            ...savedAddresses
        ].slice(0, 6);
        writeStoredJSON('fixentra_saved_addresses', savedAddresses);
    }
    persistUserState();
}

function formatCurrency(amount) {
    return `₹${Math.round(amount).toLocaleString()}`;
}

function getLocalityInsight(locality) {
    return localityInsights.find(item => item.name === locality) || localityInsights[0];
}

function getActiveService() {
    return allServices.find(service => service._id === document.getElementById('modal-service-id')?.value) || null;
}

function getRouteFromLocation() {
    const hashRoute = window.location.hash.replace(/^#/, '');
    if (hashRoute) return hashRoute;
    if (window.location.pathname === '/reset-password') {
        return `reset-password${window.location.search || ''}`;
    }
    return 'home';
}

function getViewKey(route) {
    return String(route || 'home').replace(/^#/, '').split('?')[0] || 'home';
}

function getResetTokenFromLocation() {
    const route = getRouteFromLocation();
    const query = route.includes('?') ? route.split('?')[1] : window.location.search.replace(/^\?/, '');
    return new URLSearchParams(query).get('token') || '';
}

async function ensureServicesLoaded(options = {}) {
    const resolvedOptions = typeof options === 'boolean' ? { force: options } : options;
    const { force = false, silent = false } = resolvedOptions;
    if (allServices.length && !force) return true;
    try {
        const query = preferredLocality ? `?locality=${encodeURIComponent(preferredLocality)}` : '';
        const response = await fetch(`${API_URL}/api/services${query}`);
        const data = await response.json();
        allServices = data.data.services || [];
        return allServices.length > 0;
    } catch (err) {
        if (!silent) {
            showToast('Could not load the service catalog right now.', 'error');
        }
        return false;
    }
}

async function ensurePublicProvidersLoaded(options = {}) {
    const resolvedOptions = typeof options === 'boolean' ? { force: options } : options;
    const { force = false, silent = false } = resolvedOptions;
    if (publicProviderCatalogLoaded && !force) return true;
    try {
        const query = preferredLocality ? `?locality=${encodeURIComponent(preferredLocality)}` : '';
        const response = await fetch(`${API_URL}/api/auth/providers/public${query}`);
        const data = await response.json();
        if (data.status === 'success') {
            publicProviderCatalog = data.data.providers || [];
            publicProviderCatalogLoaded = true;
            return true;
        }
        throw new Error(data.message || 'Could not load providers');
    } catch (err) {
        publicProviderCatalog = [];
        publicProviderCatalogLoaded = false;
        if (!silent) {
            showToast('Could not load provider availability right now.', 'warning');
        }
        return false;
    }
}

async function loadProviders(force = false) {
    if (!token) return [];
    if (!force && providerDirectory.length) return providerDirectory;
    try {
        const response = await fetch(`${API_URL}/api/auth/providers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.status === 'success') {
            providerDirectory = data.data.providers || [];
            return providerDirectory;
        }
    } catch (err) {
        console.error('Provider load error:', err);
    }
    providerDirectory = [];
    return providerDirectory;
}

function scoreProviderForBooking(provider, category, locality) {
    let score = (provider.rating || 0) * 10 + (provider.completedJobs || 0);
    const skills = (provider.skills || []).join(' ').toLowerCase();
    if (category && skills.includes(String(category).toLowerCase())) score += 30;
    if (locality && provider.address && provider.address.toLowerCase().includes(String(locality).toLowerCase())) score += 20;
    return score;
}

// ===== #99 DYNAMIC CONFIG LOAD =====
async function loadConfig() {
    try {
        const res = await fetch(`${API_URL}/api/auth/config`);
        const data = await res.json();
        if(data.googleClientId && data.googleClientId !== 'your_google_client_id_here') {
            GOOGLE_CLIENT_ID = data.googleClientId;
        }
    } catch(e) { console.error('Failed to load server config', e); }
}

// ===== #63 PWA INSTALL LOGIC =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Banner is rendered in Home view
});

async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') showToast('Fixentra added to your home screen! 🎉', 'success');
    deferredPrompt = null;
}

// ===== #14 LOADING SCREEN =====
window.addEventListener('load', async () => {
    await loadConfig();
    Promise.allSettled([
        ensureServicesLoaded({ silent: true }),
        ensurePublicProvidersLoaded({ silent: true })
    ]).then(results => {
        const loadedSomething = results.some(result => result.status === 'fulfilled' && result.value);
        const currentRoute = activeRoute || getRouteFromLocation();
        if (loadedSomething && ['home', 'services', 'leaderboard'].includes(getViewKey(currentRoute))) {
            showView(currentRoute, { force: true, skipHashUpdate: true });
        }
    });
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1600);
    // #20 Onboarding
    if (!localStorage.getItem('fixentra_onboarded')) {
        setTimeout(() => showOnboarding(), 2200);
    }
    initUI();

    // #102 Live Ticker Updates
    const activities = [
        "Just booked: Deep Cleaning in Kankarbagh",
        "Vikram K. is on the way to Phulwari Sharif",
        "Expert assigned: Plumber in Boring Road",
        "New Review: 5⭐ for Painter in Patliputra",
        "Flash Deal: 20% Off AC Service ending soon!"
    ];
    let activityIdx = 0;
    setInterval(() => {
        const textEl = document.getElementById('ticker-text');
        if (textEl) {
            textEl.style.opacity = '0';
            setTimeout(() => {
                activityIdx = (activityIdx + 1) % activities.length;
                textEl.innerText = activities[activityIdx];
                textEl.style.opacity = '1';
            }, 500);
        }
    }, 5000);
});

// ===== #1 DARK MODE =====
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('fixentra_theme', isDark ? 'light' : 'dark');
    showToast(isDark ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'success');
}
// Apply saved theme
(function() {
    const saved = localStorage.getItem('fixentra_theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

// ===== #10 MOBILE NAV =====
function toggleMobileNav() {
    document.getElementById('mobile-nav').classList.toggle('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-msg">${message}</span>
        <span class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(()=>this.parentElement.remove(),300)">✕</span>
        <div class="toast-progress"></div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== #15 CONFETTI =====
function triggerConfetti() {
    const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 5000);
    }
}

// ===== #18 BACK TO TOP + SCROLL PROGRESS =====
window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top');
    if (btn) {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }
    // Scroll Progress Bar
    const scrollBar = document.getElementById('scroll-progress');
    if (scrollBar) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollBar.style.width = scrollPercent + '%';
    }
});

// ===== PARALLAX ORBS =====
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    orbs.forEach((orb, i) => {
        const factor = i % 2 === 0 ? 1 : -1;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});

// ===== #2 ANIMATED COUNTERS =====
function animateCounters() {
    document.querySelectorAll('.counter').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 20);
    });
}

// ===== #20 ONBOARDING =====
const onboardingSteps = [
    { icon: '🏠', title: 'Welcome to Fixentra!', desc: 'Patna\'s most trusted platform for home services. Book verified experts in just 3 clicks.' },
    { icon: '🔍', title: 'Find & Book', desc: 'Browse from 7+ service categories. Use filters to find exactly what you need at transparent prices.' },
    { icon: '✅', title: 'Sit Back & Relax', desc: 'Our background-verified expert arrives on time. Pay only after the job is done to your satisfaction.' }
];
let onboardingStep = 0;

function showOnboarding() {
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.id = 'onboarding';
    overlay.innerHTML = renderOnboardingCard();
    document.body.appendChild(overlay);
}

function renderOnboardingCard() {
    const s = onboardingSteps[onboardingStep];
    return `<div class="onboarding-card">
        <div style="font-size:4rem; margin-bottom:1rem;">${s.icon}</div>
        <div class="onboarding-step">Step ${onboardingStep + 1} of ${onboardingSteps.length}</div>
        <h2 style="margin-bottom:1rem;">${s.title}</h2>
        <p style="color:var(--text-muted);margin-bottom:2rem;">${s.desc}</p>
        <button class="btn btn-primary btn-lg" onclick="nextOnboarding()">${onboardingStep < onboardingSteps.length - 1 ? 'Next →' : 'Get Started! 🚀'}</button>
        <div class="onboarding-dots">${onboardingSteps.map((_, i) => `<div class="onboarding-dot ${i === onboardingStep ? 'active' : ''}"></div>`).join('')}</div>
        <p style="margin-top:1.5rem;font-size:0.8rem;color:var(--text-light);cursor:pointer;" onclick="closeOnboarding()">Skip tour</p>
    </div>`;
}

function nextOnboarding() {
    onboardingStep++;
    if (onboardingStep >= onboardingSteps.length) { closeOnboarding(); return; }
    document.querySelector('.onboarding-overlay').innerHTML = renderOnboardingCard();
}

function closeOnboarding() {
    localStorage.setItem('fixentra_onboarded', 'true');
    const el = document.getElementById('onboarding');
    if (el) el.remove();
}

// ===== #46 LANGUAGE TOGGLE =====
const loc = {
    en: {
        heroTitle: 'Expert Home Services, One Tap Away.',
        heroDesc: 'Book verified electricians, plumbers, cleaners & carpenters at transparent prices. 30-day work guarantee included.',
        bookBtn: '📋 Book a Service',
        joinBtn: 'Join as Expert →',
        searchPlaceholder: 'What do you need fixed?',
        happyUsers: 'Happy Users',
        verifiedExperts: 'Verified Experts',
        avgRating: 'Avg Rating',
        trendingTitle: 'Our Trending Services',
        trendingDesc: 'Choose from our wide range of professional services, all at standardized prices.',
        navHome: 'Home', navServices: 'Services', navExpert: 'Top Experts', navCorp: 'Corporate'
    },
    hi: {
        heroTitle: 'विशेषज्ञ गृह सेवाएँ, बस एक टैप दूर।',
        heroDesc: 'पारदर्शी कीमतों पर सत्यापित इलेक्ट्रीशियन, प्लंबर, क्लीनर और बढ़ई बुक करें। 30 दिन की कार्य गारंटी शामिल है।',
        bookBtn: '📋 सेवा बुक करें',
        joinBtn: 'विशेषज्ञ के रूप में जुड़ें →',
        searchPlaceholder: 'आपको किस चीज़ की मरम्मत की ज़रूरत है?',
        happyUsers: 'खुश उपयोगकर्ता',
        verifiedExperts: 'सत्यापित विशेषज्ञ',
        avgRating: 'औसत रेटिंग',
        trendingTitle: 'हमारी ट्रेंडिंग सेवाएँ',
        trendingDesc: 'मानकीकृत कीमतों पर पेशेवर सेवाओं की हमारी विस्तृत श्रृंखला में से चुनें।',
        navHome: 'होम', navServices: 'सेवाएं', navExpert: 'शीर्ष विशेषज्ञ', navCorp: 'कॉर्पोरेट'
    },
    bhoj: {
        heroTitle: 'रउवा घर के काम, बस एक टेप दूर।',
        heroDesc: 'सस्ता अउरी बढ़िया मिस्त्री, प्लंबर, अउरी साफ-सफाई वाला लोग के बुक करीं। पूरा पटना में सबसे नीमन काम!',
        bookBtn: '📋 सेवा बुक करीं',
        joinBtn: 'मिस्त्री बनीं →',
        searchPlaceholder: 'का ठीक करावे के बा?',
        happyUsers: 'खुश लोग',
        verifiedExperts: 'बड़का मिस्त्री',
        avgRating: 'रेटिंग',
        trendingTitle: 'आज के खास सेवा सब',
        trendingDesc: 'अपना पसंद के सेवा चुनीं, दाम एकदम सही लागी।',
        navHome: 'घरे', navServices: 'सेवा सब', navExpert: 'बड़का मिस्त्री', navCorp: 'बड़ काम'
    }
};
let currentLang = 'en';

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('onclick').includes(lang)) b.classList.add('active');
    });

    // Update Navbar
    const l = loc[lang];
    document.getElementById('nav-home').innerText = l.navHome;
    document.getElementById('nav-services').innerText = l.navServices;
    document.getElementById('nav-experts').innerText = l.navExpert;
    document.getElementById('nav-corporate').innerText = l.navCorp;

    const msg = lang === 'en' ? 'Language switched to English' : (lang === 'hi' ? 'भाषा हिंदी में बदल दी गई' : 'भाषा भोजपुरी में बदल गइल');
    showToast(msg, 'info');

    const currentView = getRouteFromLocation();
    showView(currentView || 'home');
}

function syncNavigationState(activeView) {
    const items = document.querySelectorAll('.bottom-nav-item');
    const viewToIndex = {
        home: 0,
        about: 0,
        careers: 0,
        terms: 0,
        privacy: 0,
        services: 1,
        leaderboard: 1,
        corporate: 1,
        login: 2,
        register: 2,
        'reset-password': 2,
        dashboard: 3,
        admin: 3
    };
    items.forEach(item => item.classList.remove('active'));
    const activeIndex = viewToIndex[activeView];
    if (typeof activeIndex === 'number' && items[activeIndex]) {
        items[activeIndex].classList.add('active');
    }

    const accountBtn = items[2];
    if (accountBtn) {
        const svgIcon = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        accountBtn.innerHTML = `<span class="icon">${svgIcon}</span>${user ? 'Account' : 'Login'}`;
        accountBtn.setAttribute('onclick', user ? "showView('dashboard')" : "showView('login')");
    }
}

// ===== INIT UI =====
function initUI() {
    if (token && user) {
        ensureUserProfileDefaults();
        authBtns.style.display = 'none';
        userMenu.style.display = 'flex';
        userMenu.innerHTML = `
            ${user.role === 'admin' ? '<a onclick="showView(\'admin\')" role="button" tabindex="0" style="color:var(--accent);font-weight:700;">Admin Panel</a>' : ''}
            <a onclick="showView('dashboard')" role="button" tabindex="0" style="font-weight:600;font-size:0.95rem;">Dashboard</a>
            <button class="btn btn-primary" onclick="logout()" aria-label="Logout" style="border-radius:100px;padding:0.5rem 1.2rem;background:var(--danger);border-color:var(--danger);color:white;">Logout</button>
        `;
        const ml = document.getElementById('mobile-login');
        const md = document.getElementById('mobile-dashboard');
        if (ml) ml.style.display = 'none';
        if (md) md.style.display = 'block';
    } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
        const ml = document.getElementById('mobile-login');
        const md = document.getElementById('mobile-dashboard');
        if (ml) ml.style.display = 'block';
        if (md) md.style.display = 'none';
    }

    const requestedRoute = getRouteFromLocation();
    const requestedView = getViewKey(requestedRoute);
    let initialRoute = requestedRoute;

    if (token && user && ['login', 'register', 'reset-password'].includes(requestedView)) {
        initialRoute = 'dashboard';
    }

    if ((!token || !user) && ['dashboard', 'admin'].includes(requestedView)) {
        initialRoute = 'login';
    }

    showView(initialRoute || (token && user ? 'dashboard' : 'home'), { force: true, skipHashUpdate: true });
}

// ===== #9 PAGE TRANSITIONS =====
function showView(route, options = {}) {
    const view = route || 'home';
    const viewKey = getViewKey(view);
    if (!options.force && activeRoute === view) {
        syncNavigationState(viewKey);
        return;
    }
    activeRoute = view;
    if (!options.skipHashUpdate) {
        if (window.location.pathname === '/reset-password' && viewKey !== 'reset-password') {
            window.history.replaceState({}, '', `/${viewKey === 'home' ? '' : `#${view}`}`);
        } else if (window.location.pathname !== '/reset-password' && window.location.hash.replace(/^#/, '') !== view) {
            window.location.hash = view;
        }
    }
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    setTimeout(() => {
        appContainer.innerHTML = '';
        window.scrollTo(0, 0);
        switch(viewKey) {
            case 'home': renderHome(); break;
            case 'about': renderInfoPage('about'); break;
            case 'careers': renderInfoPage('careers'); break;
            case 'terms': renderInfoPage('terms'); break;
            case 'privacy': renderInfoPage('privacy'); break;
            case 'login': renderLogin(); break;
            case 'reset-password': renderResetPassword(); break;
            case 'register': renderRegister(); break;
            case 'services': renderServices(); break;
            case 'dashboard': renderDashboard(); break;
            case 'leaderboard': renderLeaderboard(); break;
            case 'corporate': renderCorporate(); break;
            case 'admin': renderAdmin(); break;
            default: renderHome();
        }
        requestAnimationFrame(() => {
            appContainer.style.transition = 'opacity 0.4s, transform 0.4s';
            appContainer.style.opacity = '1';
            appContainer.style.transform = 'translateY(0)';
        });
        syncNavigationState(viewKey);
    }, 150);
}

// ===== HOME VIEW =====
function renderHome() {
    const l = loc[currentLang];
    const experts = getFeaturedExpertsData();
    const homeServices = (allServices.length ? allServices.slice(0, 6).map((service, index) => {
        const availability = getServiceAvailability(service, index);
        return {
            id: service._id,
            name: service.name,
            category: service.category,
            price: formatCurrency(service.price),
            desc: service.description || 'Verified doorstep service with transparent pricing.',
            eta: `${availability.etaMins} mins`,
            demand: `${availability.jobsToday} bookings today`,
            area: availability.topLocality,
            experts: availability.activeExperts,
            image: getServicePrimaryImage(service),
            included: getServiceIncluded(service).slice(0, 2)
        };
    }) : [
        { id: '', name: 'Deep Home Cleaning', category: 'Cleaning', price: '₹3,499', desc: 'Full apartment reset with kitchen and bathroom detailing.', eta: '22 mins', demand: '32 bookings today', area: 'Kankarbagh', experts: 12, image: '/expert-cleaner.svg', included: ['Checklist-led execution', 'Premium cleaning kit'] },
        { id: '', name: 'Leak & Plumbing Rescue', category: 'Plumber', price: '₹599', desc: 'Fast leak fixes, fittings, and tank line inspection.', eta: '19 mins', demand: '18 bookings today', area: 'Boring Road', experts: 9, image: '/expert-plumber.svg', included: ['Leak diagnosis', 'Transparent material note'] },
        { id: '', name: 'Electric Safety Visit', category: 'Electrician', price: '₹499', desc: 'Switchboard, fan, and appliance checks by verified experts.', eta: '16 mins', demand: '21 bookings today', area: 'Rajendra Nagar', experts: 11, image: '/expert-electrician.svg', included: ['Safety inspection', 'Repair recommendation'] },
        { id: '', name: 'AC Cooling Tune-Up', category: 'Appliance', price: '₹799', desc: 'Cooling, gas, and filter tune-up with quick diagnosis.', eta: '24 mins', demand: '14 bookings today', area: 'Bailey Road', experts: 7, image: '/expert-appliance.svg', included: ['Cooling test', 'Part estimate'] },
        { id: '', name: 'Wall Repair & Paint', category: 'Painter', price: '₹4,999', desc: 'Patchwork plus room paint with a clean finish promise.', eta: '28 mins', demand: '11 bookings today', area: 'Danapur', experts: 6, image: '/hero.png', included: ['Surface prep', 'Clean finish checklist'] },
        { id: '', name: 'Pest Control Reset', category: 'Pest Control', price: '₹1,199', desc: 'Apartment-safe treatment for cockroaches, ants, and more.', eta: '26 mins', demand: '9 bookings today', area: 'Patliputra Colony', experts: 8, image: '/hero.png', included: ['Apartment-safe treatment', 'Follow-up guidance'] }
    ]);
    const categories = [
        { icon: '⚡', label: 'Electrician', color: 'purple' },
        { icon: '🔧', label: 'Plumber', color: 'blue' },
        { icon: '🧹', label: 'Cleaning', color: 'green' },
        { icon: '❄️', label: 'AC Repair', color: 'teal' },
        { icon: '🪑', label: 'Carpenter', color: 'orange' },
        { icon: '🎨', label: 'Painter', color: 'pink' },
        { icon: '🐜', label: 'Pest Control', color: 'green' },
        { icon: '🔩', label: 'Appliance', color: 'purple' }
    ];
    const testimonials = [
        { q: 'Booked for my parents in Kankarbagh. The saved home flow made repeat booking much easier.', n: 'Shivani S.', c: 'Kankarbagh', r: '⭐⭐⭐⭐⭐' },
        { q: 'The ETA and price were visible before I booked. That trust factor matters a lot.', n: 'Arvind P.', c: 'Boring Road', r: '⭐⭐⭐⭐⭐' },
        { q: 'Photo upload helped the electrician come prepared. Much smoother experience.', n: 'Nidhi R.', c: 'Rajendra Nagar', r: '⭐⭐⭐⭐⭐' },
        { q: 'Expert profile showed language, badges, and job history. Felt safer than random vendors.', n: 'Ritika K.', c: 'Patliputra Colony', r: '⭐⭐⭐⭐⭐' },
        { q: 'Emergency priority got my leak issue sorted fast. Huge relief.', n: 'Aman M.', c: 'Danapur', r: '⭐⭐⭐⭐⭐' },
        { q: 'Referral rewards and wallet balance actually made me return for AC service.', n: 'Faizan H.', c: 'Bailey Road', r: '⭐⭐⭐⭐' }
    ];

    appContainer.innerHTML = `
        <div class="page-transition">
            <section class="uc-hero" style="position:relative;overflow:hidden;">
                <div class="parallax-dots">
                    <div class="parallax-dot"></div>
                    <div class="parallax-dot"></div>
                    <div class="parallax-dot"></div>
                    <div class="parallax-dot"></div>
                </div>
                <div class="container uc-hero-content" style="position:relative;z-index:1;">
                    <div>
                        <div style="display:inline-flex;align-items:center;gap:0.5rem;background:rgba(78,205,196,0.15);border:1px solid rgba(78,205,196,0.3);padding:0.4rem 1rem;border-radius:var(--radius-full);font-size:0.8rem;font-weight:700;color:#4ECDC4;margin-bottom:1.5rem;">
                            <span style="width:8px;height:8px;border-radius:50%;background:#4ECDC4;animation:pulse 2s infinite;"></span>
                            Now serving Patna & suburbs
                        </div>
                        <h1>${l.heroTitle}</h1>
                        <p>${l.heroDesc}</p>
                        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                            <button class="btn btn-primary btn-lg" onclick="showView('services')" style="background:white;color:#6C63FF;border-radius:var(--radius-full);padding:0.9rem 2rem;">${l.bookBtn}</button>
                            <button class="btn" onclick="showView('register')" style="background:transparent;border:2px solid rgba(255,255,255,0.3);color:white;border-radius:var(--radius-full);padding:0.9rem 2rem;">${l.joinBtn}</button>
                        </div>
                        <div class="uc-hero-stats">
                            <div class="uc-hero-stat"><h3><span class="counter" data-target="500" data-suffix="+">0</span></h3><p>${l.happyUsers}</p></div>
                            <div class="uc-hero-stat"><h3><span class="counter" data-target="50" data-suffix="+">0</span></h3><p>${l.verifiedExperts}</p></div>
                            <div class="uc-hero-stat"><h3>4.8★</h3><p>${l.avgRating}</p></div>
                        </div>
                    </div>
                    <div class="uc-hero-right">
                        <div class="uc-hero-card">
                            <h4>🔍 Search Services</h4>
                            <div style="position:relative;margin-top:0.75rem;">
                                <input class="search-input" id="hero-search" type="text" placeholder="${l.searchPlaceholder}" oninput="handleSearch(this.value)" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;border-radius:var(--radius-full);padding:0.85rem 1.2rem 0.85rem 2.8rem;">
                                <span style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);">🔍</span>
                                <div class="search-results" id="search-results"></div>
                            </div>
                        </div>
                        <div class="uc-hero-card">
                            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                                <span style="font-size:1.2rem;">⏱️</span>
                                <span id="ticker-text" style="font-weight:600;font-size:0.9rem;">Just booked: Sofa Cleaning in Kankarbagh</span>
                            </div>
                            <p>Real-time bookings happening across Patna</p>
                        </div>
                        <div class="uc-hero-card">
                            <h4>📍 Quick Locality Check</h4>
                            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;">
                                ${localityInsights.slice(0, 4).map(item => `<button class="locality-pill" onclick="selectLocalityAndBrowse('${item.name}')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:white;font-size:0.78rem;padding:0.4rem 0.8rem;"><span>${item.name}</span> <strong style="color:#4ECDC4;">${item.eta}m</strong></button>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="trust-strip reveal">
                <div class="container">
                    <div class="trust-items">
                        <div class="trust-item"><div class="trust-icon">✅</div>Background Verified</div>
                        <div class="trust-item"><div class="trust-icon">🛡️</div>30-Day Guarantee</div>
                        <div class="trust-item"><div class="trust-icon">💰</div>Transparent Pricing</div>
                        <div class="trust-item"><div class="trust-icon">⚡</div>Same Day Service</div>
                        <div class="trust-item"><div class="trust-icon">💬</div>WhatsApp Support</div>
                    </div>
                    <div style="text-align:center;margin-top:0.75rem;">
                        <span class="live-counter"><span class="live-dot"></span> <span id="live-booking-count">47</span> services booked in Patna today</span>
                    </div>
                </div>
            </section>

            <section class="uc-categories reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">SERVICES</span>
                        <h2>What are you looking for?</h2>
                        <p>Select a category to explore our verified service professionals</p>
                    </div>
                    <div class="category-grid stagger-children">
                        ${categories.map(cat => `
                            <div class="category-item" onclick="showView('services')">
                                <div class="category-icon ${cat.color}">${cat.icon}</div>
                                <span>${cat.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="how-it-works reveal" style="background:var(--bg-section);">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">HOW IT WORKS</span>
                        <h2>Book a service in 3 simple steps</h2>
                    </div>
                    <div class="steps-row stagger-children">
                        <div class="step-item"><div class="step-number">1</div><h4>Choose Service</h4><p>Select what you need from our wide range of categories</p></div>
                        <div class="step-item"><div class="step-number">2</div><h4>Book & Schedule</h4><p>Pick your preferred date, time slot and locality</p></div>
                        <div class="step-item"><div class="step-number">3</div><h4>Get It Done</h4><p>Verified expert arrives on time. Pay after satisfaction</p></div>
                    </div>
                </div>
            </section>

            <section class="uc-section reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">TRENDING NOW</span>
                        <h2>${l.trendingTitle}</h2>
                        <p>Most booked services this week with transparent pricing</p>
                    </div>
                    <div class="uc-service-grid stagger-children">
                        ${homeServices.map(service => {
                            const numPrice = parseInt(service.price.replace(/[^0-9]/g,''));
                            const marketPrice = Math.round(numPrice * 1.45);
                            const savePercent = Math.round((1 - numPrice/marketPrice) * 100);
                            return `
                            <div class="uc-service-card" onclick="${service.id ? `openBookingModal('${service.id}','${service.name.replace(/'/g, "\\'")}')` : `showView('services')`}">
                                <img class="card-img" src="${normalizeImageSrc(service.image)}" alt="${service.name}" loading="lazy">
                                <div class="card-body">
                                    <div style="display:inline-block;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--primary);background:var(--primary-light);padding:0.2rem 0.6rem;border-radius:var(--radius-full);margin-bottom:0.5rem;">${service.category}</div>
                                    <h3>${service.name}</h3>
                                    <div class="card-meta"><span>⏱ ${service.eta}</span><span>📍 ${service.area}</span><span>🔥 ${service.demand}</span></div>
                                    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">${service.desc}</p>
                                    <div class="card-footer">
                                        <div>
                                            <span class="price-from">Starting from</span>
                                            <span class="card-price">${service.price}</span>
                                            <span class="price-was">₹${marketPrice.toLocaleString()}</span>
                                            <span class="price-save">${savePercent}% OFF</span>
                                        </div>
                                        <button class="btn btn-primary" style="padding:0.5rem 1.2rem;font-size:0.82rem;border-radius:var(--radius-full);">Book Now</button>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                    <div style="text-align:center;margin-top:2rem;">
                        <button class="btn btn-outline" onclick="showView('services')" style="border-radius:var(--radius-full);padding:0.75rem 2rem;">View All Services →</button>
                    </div>
                </div>
            </section>

            <section class="uc-section alt reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">COVERAGE</span>
                        <h2>Available in your neighborhood</h2>
                        <p>Real-time availability across Patna localities</p>
                    </div>
                    <div class="uc-service-grid stagger-children">
                        ${localityInsights.slice(0, 6).map(item => `
                            <div class="uc-service-card" onclick="selectLocalityAndBrowse('${item.name}')" style="cursor:pointer;">
                                <div class="card-body">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                                        <h3 style="margin-bottom:0;">📍 ${item.name}</h3>
                                        <span style="background:var(--secondary-light);color:var(--secondary);font-size:0.75rem;font-weight:700;padding:0.3rem 0.6rem;border-radius:var(--radius-full);">${item.eta} min</span>
                                    </div>
                                    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">${item.coverage}</p>
                                    <div style="display:flex;gap:1.5rem;font-size:0.82rem;color:var(--text-muted);">
                                        <span><strong style="color:var(--text);">${item.experts}</strong> experts</span>
                                        <span><strong style="color:var(--text);">${item.jobsToday}</strong> jobs today</span>
                                        <span>⭐ ${item.rating}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="referral-banner" onclick="openReferralModal()">
                        <div class="ref-icon">🎁</div>
                        <div class="ref-text">
                            <h4>Invite friends & earn ₹100 each!</h4>
                            <p>Share your referral code. Both you and your friend get ₹100 wallet credits.</p>
                        </div>
                        <span style="margin-left:auto;font-size:1.2rem;color:#92400e;">→</span>
                    </div>
                </div>
            </section>

            <section class="uc-section reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">TOP RATED</span>
                        <h2>Meet our verified professionals</h2>
                        <p>Background-checked experts with proven track records</p>
                    </div>
                    <div class="uc-expert-grid stagger-children">
                        ${experts.slice(0, 4).map(expert => {
                            const badgeMap = {
                                'Police Verified': '<span class="verification-badge badge-verified"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Verified</span>',
                                'Top 1%': '<span class="verification-badge badge-top">🏆 Top 1%</span>',
                                'Women Safety': '<span class="verification-badge badge-women">♀ Women Safety</span>',
                                'Fast ETA': '<span class="verification-badge badge-fast">⚡ Fast ETA</span>'
                            };
                            return `
                            <div class="uc-expert-card">
                                <div class="uc-expert-avatar"><img src="${normalizeImageSrc(expert.image)}" alt="${expert.name}" loading="lazy"></div>
                                <h4>${expert.name}</h4>
                                <p class="role">${expert.role}</p>
                                <div class="expert-stats">
                                    <div><strong>⭐ ${expert.rating}</strong>Rating</div>
                                    <div><strong>${expert.jobs}</strong>Jobs</div>
                                    <div><strong>${expert.eta}</strong>ETA</div>
                                </div>
                                <div style="display:flex;flex-wrap:wrap;gap:0.4rem;justify-content:center;margin-bottom:1rem;">
                                    ${expert.badges.map(b => badgeMap[b] || `<span class="verification-badge badge-elite">${b}</span>`).join('')}
                                </div>
                                <div style="display:flex;gap:0.5rem;justify-content:center;">
                                    <button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.8rem;border-radius:var(--radius-full);" onclick="openExpertProfile('${expert.id}')">Profile</button>
                                    <button class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.8rem;border-radius:var(--radius-full);" onclick="bookFeaturedExpert('${expert.id}')">Book</button>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </section>

            <section class="uc-pricing reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">COMPARE & SAVE</span>
                        <h2>Why choose Fixentra?</h2>
                        <p>Transparent pricing that saves you money</p>
                    </div>
                    <div style="overflow-x:auto;border-radius:var(--radius);">
                        <table>
                            <thead><tr><th>Service</th><th>Local Market</th><th>Fixentra Price</th><th>You Save</th></tr></thead>
                            <tbody>
                                <tr><td>Home Deep Cleaning</td><td>₹5,000 - ₹7,000</td><td class="highlight">₹3,499</td><td class="savings">Up to 50%</td></tr>
                                <tr><td>Electrician Visit</td><td>₹800 - ₹1,200</td><td class="highlight">₹499</td><td class="savings">Up to 58%</td></tr>
                                <tr><td>Plumber Repair</td><td>₹800 - ₹1,500</td><td class="highlight">₹599</td><td class="savings">Up to 60%</td></tr>
                                <tr><td>Carpenter Work</td><td>₹1,200 - ₹2,000</td><td class="highlight">₹899</td><td class="savings">Up to 55%</td></tr>
                                <tr><td>Wall Painting</td><td>₹7,000 - ₹10,000</td><td class="highlight">₹4,999</td><td class="savings">Up to 50%</td></tr>
                                <tr><td>Pest Control</td><td>₹1,500 - ₹2,500</td><td class="highlight">₹1,199</td><td class="savings">Up to 52%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section class="uc-testimonials reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker" style="background:rgba(255,255,255,0.1);color:#4ECDC4;">REVIEWS</span>
                        <h2 style="color:white;">Trusted by <span class="counter" data-target="500" data-suffix="+">0</span> Patna households</h2>
                        <p style="color:rgba(255,255,255,0.6);">Real reviews from real customers</p>
                    </div>
                    <div class="testimonial-carousel">
                        <div class="testimonial-track" id="testimonial-track">
                            ${testimonials.map(t => `
                                <div class="uc-testimonial-card">
                                    <div class="stars">${t.r}</div>
                                    <p class="quote">"${t.q}"</p>
                                    <p class="author">${t.n}</p>
                                    <p class="location">📍 ${t.c}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="carousel-controls">
                        <button class="carousel-arrow" onclick="moveTestimonials(-1)">←</button>
                        <div class="carousel-dots" id="testimonial-dots">
                            ${testimonials.map((_, i) => `<button class="t-dot${i===0?' active':''}" onclick="goToTestimonial(${i})"></button>`).join('')}
                        </div>
                        <button class="carousel-arrow" onclick="moveTestimonials(1)">→</button>
                    </div>
                </div>
            </section>

            <section class="uc-section reveal">
                <div class="container">
                    <div class="uc-section-head">
                        <span class="section-kicker">FAQ</span>
                        <h2>Frequently asked questions</h2>
                    </div>
                    <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:0.75rem;" class="stagger-children">
                        ${[
                            {q:'Are the experts background verified?',a:'Yes. Every provider undergoes a rigorous 3-step ID check, skill assessment, and personal interview.'},
                            {q:'Can I book for parents or another property?',a:'Yes. The flow supports saved homes and family profiles for repeat bookings.'},
                            {q:"What if I'm not happy with the service?",a:'We offer a 30-day Fixentra Guarantee. We will send another expert free of charge.'},
                            {q:'How fast can someone arrive?',a:'ETAs are shown based on your selected locality. Most experts arrive within 20-30 minutes.'},
                            {q:'How do I cancel or reschedule?',a:'You can cancel or reschedule any booking from your Dashboard up to 2 hours before the appointment at no cost.'}
                        ].map(f => `
                            <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius);padding:1.25rem;cursor:pointer;transition:all 0.3s ease;" onclick="const a=this.querySelector('.faq-answer');const i=this.querySelector('.faq-icon');if(a.style.maxHeight){a.style.maxHeight=null;i.textContent='+';}else{a.style.maxHeight=a.scrollHeight+'px';i.textContent='−';}" onmouseenter="this.style.borderColor='rgba(108,99,255,0.3)'" onmouseleave="this.style.borderColor='var(--border-color)'">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <h4 style="font-size:0.95rem;">${f.q}</h4><span class="faq-icon" style="color:var(--primary);font-size:1.2rem;font-weight:700;transition:transform 0.3s;">+</span>
                                </div>
                                <p class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;color:var(--text-muted);font-size:0.9rem;margin-top:0.75rem;line-height:1.7;">${f.a}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="uc-section reveal-scale" style="padding-bottom:0;">
                <div class="container">
                    <div class="uc-cta-banner">
                        <h2>Ready to get started?</h2>
                        <p>Join 500+ Patna households who trust Fixentra for their home services</p>
                        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
                            <button class="btn btn-lg" onclick="showView('services')" style="background:white;color:var(--primary);border-radius:var(--radius-full);">Explore Services</button>
                            <button class="btn btn-lg" onclick="showView('corporate')" style="background:transparent;border:2px solid white;color:white;border-radius:var(--radius-full);">Corporate Booking</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer class="uc-footer">
                <div class="container">
                    <div class="uc-footer-grid">
                        <div>
                            <div class="logo" style="font-size:1.8rem;display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem;"><img src="logo.svg" alt="Fixentra" style="width:36px;height:36px;object-fit:contain;filter:brightness(10);">FIXENTRA.</div>
                            <p style="color:rgba(255,255,255,0.5);font-size:0.9rem;line-height:1.7;max-width:280px;margin-bottom:1rem;">Patna's trusted platform for verified home services. Expert care with a 30-day satisfaction guarantee.</p>
                            <span style="font-size:0.8rem;color:#4ECDC4;font-weight:700;">📍 Serving Patna & Suburbs</span>
                        </div>
                        <div>
                            <h4>Company</h4>
                            <a href="/about.html">About Us</a>
                            <a href="/careers.html">Careers</a>
                            <a href="/terms.html">Terms & Conditions</a>
                            <a href="/privacy.html">Privacy Policy</a>
                        </div>
                        <div>
                            <h4>Services</h4>
                            <a onclick="showView('services')" style="cursor:pointer;">Deep Cleaning</a>
                            <a onclick="showView('services')" style="cursor:pointer;">Electrical & Plumbing</a>
                            <a onclick="showView('services')" style="cursor:pointer;">AC Maintenance</a>
                            <a onclick="showView('corporate')" style="cursor:pointer;">Corporate Bookings</a>
                        </div>
                        <div>
                            <h4>Get in Touch</h4>
                            <a onclick="window.open('mailto:support@fixentra.in')" style="cursor:pointer;">✉️ support@fixentra.in</a>
                            <a onclick="window.open('https://wa.me/919876543210','_blank')" style="cursor:pointer;">💬 WhatsApp Support</a>
                            <a onclick="showView('corporate')" style="cursor:pointer;">🏢 Corporate Enquiry</a>
                        </div>
                    </div>
                    <div class="uc-footer-bottom">
                        <p>© ${new Date().getFullYear()} Fixentra Technologies Pvt Ltd. Made with ❤️ in Patna.</p>
                        <div class="uc-footer-badges">
                            <span class="uc-footer-badge">🔒 256-Bit Secure</span>
                            <span class="uc-footer-badge">⭐ 4.9 Rated</span>
                            <span class="uc-footer-badge">✅ Verified Experts</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;
    currentCarouselSlide = 0;
    setTimeout(() => {
        animateCounters();
        initScrollReveal();
        initSocialProof();
        initLiveCounter();
        initTestimonialAutoplay();
    }, 300);
}


// ===== #27 CAROUSEL =====
function moveCarousel(dir) {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = track.querySelectorAll('.carousel-slide');
    currentCarouselSlide = Math.max(0, Math.min(currentCarouselSlide + dir, slides.length - 1));
    track.style.transform = `translateX(-${currentCarouselSlide * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === currentCarouselSlide));
}
function goToSlide(i) { currentCarouselSlide = i - 1; moveCarousel(1); }

// ===== #19 SEARCH (DEBOUNCED) =====
let searchTimer;
function handleSearch(query) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        const resultsDiv = document.getElementById('search-results');
        if (!query.trim()) { resultsDiv.classList.remove('active'); return; }
        const services = ['Home Deep Cleaning','Electrician','Plumber','Carpenter','AC Repair','Kitchen Cleaning','Furniture Assembly','Wall Painting','Pest Control','Inverter Repair','Water Tank Cleaning','Cooler Repair','Water Purifier Service'];
        const filtered = services.filter(s => s.toLowerCase().includes(query.toLowerCase()));
        if (filtered.length) {
            resultsDiv.innerHTML = filtered.map(s => `<div class="search-item" onclick="showView('services');document.getElementById('search-results').classList.remove('active');">${s}</div>`).join('');
            resultsDiv.classList.add('active');
        } else {
            resultsDiv.innerHTML = '<div class="search-item" style="color:var(--text-light);">No services found</div>';
            resultsDiv.classList.add('active');
        }
    }, 300);
}

// ===== #65 VOICE SEARCH =====
let recognition;
function toggleVoiceSearch() {
    const btn = document.getElementById('voice-btn');
    const input = document.getElementById('hero-search');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice search is not supported in this browser', 'error');
        return;
    }

    if (btn.classList.contains('listening')) {
        if (recognition) recognition.stop();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
        btn.classList.add('listening');
        input.placeholder = 'Listening...';
        if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
    };

    recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        input.value = transcript;
        handleSearch(transcript);
    };

    recognition.onend = () => {
        btn.classList.remove('listening');
        input.placeholder = 'What do you need fixed?';
    };

    recognition.onnomatch = () => {
        showToast('Could not understand. Please try again.', 'warning');
    };

    recognition.start();
}

function selectLocalityAndBrowse(locality) {
    preferredLocality = locality;
    publicProviderCatalogLoaded = false;
    showToast(`Showing availability for ${locality}`, 'info');
    if (getViewKey(activeRoute || getRouteFromLocation()) === 'services') {
        renderServices();
    } else {
        showView('services');
    }
}

function getExpertCategory(expert) {
    const expertText = `${expert?.role || ''} ${(expert?.services || []).join(' ')}`.toLowerCase();
    if (expertText.includes('electric')) return 'electrician';
    if (expertText.includes('clean')) return 'cleaning';
    if (expertText.includes('plumb')) return 'plumber';
    if (expertText.includes('appliance') || expertText.includes('ac ') || expertText.includes('ro ')) return 'appliance repair';
    if (expertText.includes('paint')) return 'painter';
    return '';
}

async function bookFeaturedExpert(expertId) {
    await ensurePublicProvidersLoaded({ silent: true });
    const expert = getFeaturedExpertsData().find(item => item.id === expertId);
    const loaded = await ensureServicesLoaded();
    if (!loaded) return;
    const category = getExpertCategory(expert);
    const matchedService = allServices.find(service => (service.category || '').toLowerCase() === category) || allServices[0];
    if (!matchedService) {
        showView('services');
        return;
    }
    preferredLocality = expert?.area || preferredLocality;
    await openBookingModal(matchedService._id, matchedService.name);
    const matchedProvider = publicProviderCatalog.find(item => String(item._id) === String(expert?.id));
    if (matchedProvider) {
        document.getElementById('modal-provider-id').value = matchedProvider._id;
    }
    document.getElementById('booking-issue').value = expert ? `Prefer ${expert.name} (${expert.role}) if available for this job.` : '';
    if (expert?.area) {
        document.getElementById('booking-locality').value = expert.area;
    }
    updateBookingSummary();
    if (expert) {
        showToast(`${expert.name}'s booking flow is ready.`, 'success');
    }
}

function openExpertProfile(expertId) {
    const experts = getFeaturedExpertsData();
    const expert = experts.find(item => item.id === expertId) || experts[0] || featuredExperts[0];
    const content = document.getElementById('expert-detail-content');
    content.innerHTML = `
        <div class="summary-shell" style="margin-bottom:1.5rem;">
            <div style="display:flex;align-items:center;gap:1rem;">
                <div class="expert-avatar" style="width:72px;height:72px;font-size:2rem;">${expert.image ? `<img src="${normalizeImageSrc(expert.image)}" alt="${expert.name}">` : expert.emoji}</div>
                <div>
                    <p class="summary-label">${expert.role}</p>
                    <h2 style="margin-bottom:0.25rem;">${expert.name}</h2>
                    <p style="color:var(--text-muted);">${expert.area} · ${expert.languages} · ETA ${expert.eta}</p>
                </div>
            </div>
            <div class="summary-price">${expert.rating}★</div>
        </div>
        <div class="chip-row" style="margin-bottom:1.25rem;">
            ${expert.badges.map(badge => `<span class="chip muted-chip">${badge}</span>`).join('')}
        </div>
        <p style="color:var(--text-muted);line-height:1.8;margin-bottom:1.5rem;">${expert.bio}</p>
        <div class="mini-grid" style="margin-bottom:1.5rem;">
            ${expert.highlights.map(item => `
                <div class="mini-stat-card">
                    <span class="mini-stat-title">Highlight</span>
                    <strong>${item}</strong>
                    <span class="mini-stat-meta">Trusted by repeat Fixentra users</span>
                </div>
            `).join('')}
        </div>
        <div class="summary-list" style="margin-bottom:1.5rem;">
            ${expert.services.map(service => `<div class="summary-row"><span>Service</span><strong>${service}</strong></div>`).join('')}
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="closeModal('expert-detail-modal')">Close</button>
            <button class="btn btn-primary" onclick="closeModal('expert-detail-modal');bookFeaturedExpert('${expert.id}')">Book This Expert</button>
        </div>
    `;
    document.getElementById('expert-detail-modal').style.display = 'flex';
}

async function rebookService(serviceId, serviceName, locality, address, familyProfile) {
    if (!serviceId) {
        showView('services');
        return;
    }
    preferredLocality = locality || preferredLocality;
    await openBookingModal(serviceId, serviceName);
    if (locality) document.getElementById('booking-locality').value = locality;
    if (address) document.getElementById('booking-address').value = address;
    const matchedHome = savedAddresses.find(item => item.address === address || address.includes(item.address));
    if (matchedHome) {
        document.getElementById('booking-home-select').value = matchedHome.id;
    }
    const matchedFamily = familyProfiles.find(item => item.label === familyProfile || item.id === familyProfile);
    if (matchedFamily) {
        document.getElementById('booking-family-profile').value = matchedFamily.id;
    }
    showBookingStep(2);
    updateBookingSummary();
    showToast(`Rebooking ${serviceName}`, 'success');
}

function getHomesManagerMarkup() {
    return `
        <div class="summary-shell" style="margin-bottom:1.5rem;">
            <div>
                <p class="summary-label">Repeat-booking setup</p>
                <h2 style="margin-bottom:0.25rem;">Saved Homes & Family Profiles</h2>
                <p style="color:var(--text-muted);font-size:0.92rem;">Manage the property and person shortcuts that make Fixentra faster than a generic booking form.</p>
            </div>
            <div class="summary-price">${savedAddresses.length + familyProfiles.length}</div>
        </div>
        <div class="mini-grid" style="margin-bottom:1.5rem;">
            <div class="mini-stat-card">
                <span class="mini-stat-title">Properties</span>
                <strong>${savedAddresses.length}</strong>
                <span class="mini-stat-meta">Home, office, parents, rentals</span>
            </div>
            <div class="mini-stat-card">
                <span class="mini-stat-title">Profiles</span>
                <strong>${familyProfiles.length}</strong>
                <span class="mini-stat-meta">Ideal for family or caretaker bookings</span>
            </div>
        </div>
        <div class="summary-list" style="margin-bottom:1.5rem;">
            ${savedAddresses.map(home => `<div class="summary-row"><span>${home.label}</span><strong>${home.locality} <button type="button" class="link-btn" onclick="removeSavedHome('${home.id}')">Remove</button></strong></div>`).join('')}
        </div>
        <div class="summary-list" style="margin-bottom:1.5rem;">
            ${familyProfiles.map(profile => `<div class="summary-row"><span>${profile.label}</span><strong>${profile.phoneHint || 'Saved profile'}${profile.id !== 'self' ? ` <button type="button" class="link-btn" onclick="removeFamilyProfile('${profile.id}')">Remove</button>` : ''}</strong></div>`).join('')}
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" type="button" onclick="addSavedHomePrompt()">+ Add Property</button>
            <button class="btn btn-outline" type="button" onclick="addFamilyProfilePrompt()">+ Add Profile</button>
            <button class="btn btn-primary" type="button" onclick="document.getElementById('homes-manager-modal').remove()">Done</button>
        </div>
    `;
}

function openHomesManager() {
    const existing = document.getElementById('homes-manager-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'homes-manager-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:620px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <div id="homes-manager-body">${getHomesManagerMarkup()}</div>
        </div>
    `;
    document.body.appendChild(modal);
}

function refreshHomesManager() {
    const body = document.getElementById('homes-manager-body');
    if (body) body.innerHTML = getHomesManagerMarkup();
    populateBookingHelpers();
}

function addSavedHomePrompt() {
    const label = prompt('Property label', `Saved Home ${savedAddresses.length + 1}`);
    const locality = prompt('Locality in Patna', preferredLocality || 'Boring Road');
    const address = prompt('Full address');
    if (!label || !locality || !address) return;
    savedAddresses = [{ id: `home-${Date.now()}`, label, locality, address }, ...savedAddresses].slice(0, 8);
    writeStoredJSON('fixentra_saved_addresses', savedAddresses);
    refreshHomesManager();
    showToast(`${label} added to saved properties.`, 'success');
}

function addFamilyProfilePrompt() {
    const label = prompt('Profile label', 'Parents');
    const hint = prompt('Short note', 'For family support visits');
    if (!label || !hint) return;
    familyProfiles = [...familyProfiles, { id: `profile-${Date.now()}`, label, phoneHint: hint }].slice(0, 8);
    writeStoredJSON('fixentra_family_profiles', familyProfiles);
    refreshHomesManager();
    showToast(`${label} profile added.`, 'success');
}

function removeSavedHome(id) {
    savedAddresses = savedAddresses.filter(item => item.id !== id);
    writeStoredJSON('fixentra_saved_addresses', savedAddresses);
    refreshHomesManager();
}

function removeFamilyProfile(id) {
    if (id === 'self') {
        showToast('Primary profile cannot be removed.', 'warning');
        return;
    }
    familyProfiles = familyProfiles.filter(item => item.id !== id);
    writeStoredJSON('fixentra_family_profiles', familyProfiles);
    refreshHomesManager();
}

function renderInfoPage(type) {
    const page = infoPages[type];
    if (!page) {
        renderHome();
        return;
    }
    appContainer.innerHTML = `
        <div class="page-transition container info-page-shell" style="position:relative;padding-bottom:6rem;margin-top:2rem;">
            <div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>${page.title}</span></div>
            <section class="info-hero">
                <div>
                    <span class="section-kicker">${page.kicker}</span>
                    <h1 style="margin:0.85rem 0 1rem;">${page.title}</h1>
                    <p class="info-lead">${page.intro}</p>
                    <div class="cta-row" style="margin-top:2rem;">
                        <button class="btn btn-primary" onclick="showView('${page.ctaView}')">${page.ctaLabel}</button>
                        <button class="btn btn-outline" onclick="showView('home')">Back Home</button>
                    </div>
                </div>
                <div class="info-side-card">
                    <div class="summary-shell" style="margin-bottom:1rem;">
                        <div>
                            <p class="summary-label">FIXENTRA</p>
                            <h3 style="margin-bottom:0.25rem;">Built for reliable home-service delivery</h3>
                            <p style="color:var(--text-muted);font-size:0.92rem;">Openable, readable pages with real product context instead of dead footer links.</p>
                        </div>
                        <img src="logo.svg" alt="Fixentra" style="width:64px;height:64px;object-fit:contain;">
                    </div>
                    <div class="info-mini-list">
                        ${page.highlights.map(item => `<div class="info-bullet">${item}</div>`).join('')}
                    </div>
                </div>
            </section>

            <section class="info-stat-grid">
                ${page.stats.map(item => `
                    <div class="mini-stat-card">
                        <span class="mini-stat-title">${item.label}</span>
                        <strong>${item.value}</strong>
                        <span class="mini-stat-meta">${page.title}</span>
                    </div>
                `).join('')}
            </section>

            <section class="info-section-grid">
                ${page.sections.map(section => `
                    <article class="info-section-card">
                        <h3>${section.title}</h3>
                        <p>${section.body}</p>
                    </article>
                `).join('')}
            </section>
        </div>
    `;
}

function openInfoModal(type) {
    showView(type);
}

function subscribeNewsletter(trigger) {
    const input = trigger?.parentElement?.querySelector('input[type="email"]');
    const email = input?.value?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Enter a valid email address.', 'warning');
        return;
    }
    if (!newsletterSubscribers.includes(email)) {
        newsletterSubscribers = [email, ...newsletterSubscribers].slice(0, 50);
        writeStoredJSON('fixentra_newsletter_subscribers', newsletterSubscribers);
    }
    input.value = '';
    showToast('Subscribed. 15% welcome deal unlocked.', 'success');
}

function openPlanModal(planName) {
    if (user && !savedPlanInterests.some(item => item.email === user.email && item.planName === planName)) {
        savedPlanInterests = [{ planName, email: user.email, createdAt: new Date().toISOString() }, ...savedPlanInterests].slice(0, 30);
        writeStoredJSON('fixentra_plan_interest', savedPlanInterests);
    }
    const existing = document.getElementById('plan-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'plan-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:520px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <p class="summary-label">PLAN INTEREST</p>
            <h2 style="margin-bottom:0.5rem;">${planName}</h2>
            <p style="color:var(--text-muted);line-height:1.8;">Your interest has been recorded${user ? ` for ${user.email}` : ''}. This keeps the CTA real instead of acting like a placeholder button.</p>
            <div class="summary-list" style="margin-top:1.25rem;">
                <div class="summary-row"><span>Recorded plan</span><strong>${planName}</strong></div>
                <div class="summary-row"><span>Next best action</span><strong>${planName === 'Society Pro' ? 'Corporate onboarding' : 'Membership activation'}</strong></div>
            </div>
            <div class="form-actions" style="margin-top:1.5rem;">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn-primary" onclick="${planName === 'Society Pro' ? `this.closest('.modal').remove();showView('corporate')` : `activatePlan('${planName.replace(/'/g, "\\'")}')`}">Continue</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function activatePlan(planName) {
    document.getElementById('plan-modal')?.remove();
    if (!user) {
        showToast('Create an account to activate this plan.', 'info');
        showView('register');
        return;
    }
    user.subscriptionPlan = planName;
    user.loyaltyPoints = (user.loyaltyPoints || 0) + (planName === 'Family Shield' ? 50 : 30);
    persistUserState();
    showToast(`${planName} is now active on this account.`, 'success');
    showView('dashboard', { force: true });
}

async function openComboBooking(comboType) {
    const loaded = await ensureServicesLoaded();
    if (!loaded) return;
    const serviceMap = {
        deep_combo: ['cleaning', 'pest control'],
        summer_combo: ['appliance repair', 'plumber'],
        family_support: ['plumber', 'electrician']
    };
    const categories = serviceMap[comboType] || [];
    const matched = allServices.find(service => categories.includes(service.category)) || allServices[0];
    if (!matched) {
        showToast('No matching service found for this combo.', 'warning');
        return;
    }
    await openBookingModal(matched._id, matched.name, false);
    document.getElementById('booking-issue').value = comboType === 'deep_combo'
        ? 'I want the combo flow with deep cleaning / pest control context.'
        : comboType === 'summer_combo'
            ? 'I want the AC service + plumbing combo.'
            : 'Booking for a family support visit.';
    updateBookingSummary();
    showToast('Combo flow loaded into booking.', 'success');
}

async function openSettingsModal() {
    if (!user || !token) return showView('login');
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();
    const profileImage = normalizeImageSrc(user.profileImage);
    const hasProfileImage = Boolean(profileImage && !String(user.profileImage || '').includes('default.png'));
    const isProvider = user.role === 'provider';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'settings-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:560px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <p class="summary-label">ACCOUNT SETTINGS</p>
            <h2 style="margin-bottom:1rem;">Update Profile</h2>
            <form onsubmit="saveSettings(event)">
                <div class="settings-media-preview">
                    <div class="sidebar-avatar">${hasProfileImage ? `<img src="${profileImage}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 style="margin-bottom:0.25rem;">${user.name}</h3>
                        <p style="color:var(--text-muted);font-size:0.9rem;">${isProvider ? 'Provider profile with public availability details' : 'Customer profile used for bookings and invoices'}</p>
                    </div>
                </div>
                <div class="form-group"><label>Profile Image</label><input type="file" id="settings-profile-image" accept="image/*"></div>
                <div class="form-split">
                    <div class="form-group"><label>Name</label><input type="text" id="settings-name" value="${user.name || ''}" required></div>
                    <div class="form-group"><label>Phone</label><input type="text" id="settings-phone" value="${user.phone || ''}" required></div>
                </div>
                <div class="form-group"><label>Address</label><input type="text" id="settings-address" value="${user.address || ''}" required></div>
                ${isProvider ? `
                    <div class="summary-list" style="margin-bottom:1rem;">
                        <div class="summary-row"><span>Public profile</span><strong>Visible in expert discovery</strong></div>
                        <div class="summary-row"><span>Assignment engine</span><strong>Uses skills, locality, response time</strong></div>
                    </div>
                    <div class="form-group"><label>Skills</label><input type="text" id="settings-skills" value="${(user.skills || []).join(', ')}" placeholder="electrician, appliance repair"></div>
                    <div class="form-group"><label>Working Localities</label><input type="text" id="settings-localities" value="${(user.workingLocalities || []).join(', ')}" placeholder="Boring Road, Kankarbagh"></div>
                    <div class="form-split">
                        <div class="form-group"><label>Response Time (mins)</label><input type="number" id="settings-response-time" min="5" max="180" value="${user.responseTimeMins || 18}"></div>
                        <div class="form-group"><label>Experience (years)</label><input type="number" id="settings-experience" min="0" max="50" value="${user.experience || 0}"></div>
                    </div>
                ` : ''}
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Save Changes</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveSettings(event) {
    event.preventDefault();
    const btn = event.submitter || event.target.querySelector('button[type="submit"]');
    const originalText = btn?.innerHTML;
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('settings-name').value.trim());
        formData.append('phone', document.getElementById('settings-phone').value.trim());
        formData.append('address', document.getElementById('settings-address').value.trim());

        const profileImage = document.getElementById('settings-profile-image')?.files?.[0];
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        if (user.role === 'provider') {
            formData.append('skills', document.getElementById('settings-skills').value.trim());
            formData.append('workingLocalities', document.getElementById('settings-localities').value.trim());
            formData.append('responseTimeMins', document.getElementById('settings-response-time').value.trim());
            formData.append('experience', document.getElementById('settings-experience').value.trim());
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Saving...';
        }
        const response = await fetch(`${API_URL}/api/auth/update-me`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();
        if (data.status === 'success') {
            user = data.data.user;
            ensureUserProfileDefaults();
            await ensurePublicProvidersLoaded({ force: true, silent: true });
            document.getElementById('settings-modal')?.remove();
            showToast('Profile updated successfully.', 'success');
            renderDashboard();
            return;
        }
        showToast(data.message || 'Failed to save settings.', 'error');
    } catch (err) {
        showToast('Failed to save settings.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText || 'Save Changes';
        }
    }
}

function openPastDealsModal() {
    const existing = document.getElementById('past-deals-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'past-deals-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:560px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <p class="summary-label">PAST DEALS</p>
            <h2 style="margin-bottom:1rem;">Saved offers and rewards</h2>
            <div class="summary-list">
                <div class="summary-row"><span>Referral wallet</span><strong>${formatCurrency(user?.walletBalance || 0)}</strong></div>
                <div class="summary-row"><span>Loyalty tier</span><strong>${user?.loyaltyTier || 'Priority Gold'}</strong></div>
                <div class="summary-row"><span>Plan interest</span><strong>${savedPlanInterests.length} tracked</strong></div>
                <div class="summary-row"><span>Welcome coupon</span><strong>PATNA15</strong></div>
            </div>
            <button class="btn btn-primary" style="margin-top:1.5rem;width:100%;" onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function openForgotPasswordModal() {
    const existing = document.getElementById('forgot-password-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'forgot-password-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:520px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <p class="summary-label">PASSWORD RESET</p>
            <h2 style="margin-bottom:1rem;">Forgot your password?</h2>
            <form onsubmit="submitForgotPassword(event)">
                <div class="form-group">
                    <label>Email address</label>
                    <input type="email" id="forgot-password-email" required placeholder="you@example.com">
                </div>
                <button class="btn btn-primary btn-lg" style="width:100%;">Send Reset Link</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-password-email').value.trim();
    try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            document.getElementById('forgot-password-modal')?.remove();
            showToast('Reset link sent to your email.', 'success');
            return;
        }
        showToast(data.message || 'Could not send reset email.', 'error');
    } catch (err) {
        showToast('Could not send reset email.', 'error');
    }
}

function submitCorporateLead(event) {
    event.preventDefault();
    const form = event.target;
    const lead = {
        companyName: form.querySelector('[name="company_name"]').value.trim(),
        email: form.querySelector('[name="contact_email"]').value.trim(),
        useCase: form.querySelector('[name="use_case"]').value,
        volume: form.querySelector('[name="monthly_volume"]').value,
        need: form.querySelector('[name="priority_need"]').value.trim(),
        createdAt: new Date().toISOString()
    };
    savedCorporateLeads = [lead, ...savedCorporateLeads].slice(0, 50);
    writeStoredJSON('fixentra_corporate_leads', savedCorporateLeads);
    showToast('Corporate request saved. Team follow-up queued.', 'success');
    showView('home');
}

// ===== LOGIN VIEW =====
function renderLogin() {
    appContainer.innerHTML = `
        <div class="page-transition" style="position:relative;overflow:hidden;min-height:85vh;display:flex;align-items:center;justify-content:center;">
            <div class="orb orb-1" style="top:-20%;left:-15%;"></div>
            <div class="orb orb-2" style="bottom:-20%;right:-15%;"></div>
            <!-- #16 Breadcrumb -->
            <div style="position:absolute;top:0;left:0;right:0;">
                <div class="container"><div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Login</span></div></div>
            </div>
            <div class="auth-container" style="position:relative;z-index:10;width:100%;">
                <h2 style="margin-bottom:2rem;text-align:center;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Welcome Back</h2>
                <form onsubmit="handleAuth(event,'login')">
                    <div class="form-group"><label>Email Address</label><input type="email" id="login-email" required placeholder="you@example.com"></div>
                    <div class="form-group"><label>Password</label><input type="password" id="login-password" required placeholder="••••••••"></div>
                    <p style="text-align:right;margin:-0.5rem 0 1rem;"><a onclick="openForgotPasswordModal()" style="color:var(--primary);cursor:pointer;font-size:0.85rem;font-weight:600;">Forgot password?</a></p>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Login →</button>
                    <div style="margin:2rem 0;display:flex;align-items:center;gap:1rem;">
                        <hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;"><span style="color:var(--text-light);font-size:0.8rem;">OR</span><hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;">
                    </div>
                    <div id="google-login-btn" style="display:flex;justify-content:center;"></div>
                    <p style="text-align:center;margin-top:1.5rem;color:var(--text-muted);">Don't have an account? <a onclick="showView('register')" style="color:var(--primary);cursor:pointer;font-weight:600;">Register here</a></p>
                </form>
            </div>
        </div>
    `;
    setTimeout(() => initGoogleLogin('google-login-btn'), 200);
}

function renderResetPassword() {
    const tokenParam = getResetTokenFromLocation();
    appContainer.innerHTML = `
        <div class="page-transition" style="position:relative;overflow:hidden;min-height:85vh;display:flex;align-items:center;justify-content:center;">
            <div class="orb orb-1" style="top:-20%;left:-15%;"></div>
            <div class="orb orb-2" style="bottom:-20%;right:-15%;"></div>
            <div style="position:absolute;top:0;left:0;right:0;">
                <div class="container"><div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Reset Password</span></div></div>
            </div>
            <div class="auth-container" style="position:relative;z-index:10;width:100%;">
                <h2 style="margin-bottom:1rem;text-align:center;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Create a New Password</h2>
                <p style="text-align:center;color:var(--text-muted);margin-bottom:2rem;">This route now works as a real recovery flow instead of a broken email link.</p>
                ${tokenParam ? `
                    <form onsubmit="submitResetPassword(event)">
                        <div class="form-group"><label>New Password</label><input type="password" id="reset-password-new" required minlength="6" placeholder="At least 6 characters"></div>
                        <div class="form-group"><label>Confirm Password</label><input type="password" id="reset-password-confirm" required minlength="6" placeholder="Re-enter your password"></div>
                        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Reset Password →</button>
                        <p style="text-align:center;margin-top:1.5rem;color:var(--text-muted);">Remembered it? <a onclick="showView('login')" style="color:var(--primary);cursor:pointer;font-weight:600;">Back to login</a></p>
                    </form>
                ` : `
                    <div class="card" style="text-align:center;padding:2rem;">
                        <p style="font-size:3rem;margin-bottom:1rem;">🔒</p>
                        <h3 style="margin-bottom:0.5rem;">Reset token missing</h3>
                        <p style="color:var(--text-muted);margin-bottom:1.5rem;">Open the link from your email again or request a new reset link.</p>
                        <button class="btn btn-primary" onclick="showView('login')">Go to Login</button>
                    </div>
                `}
            </div>
        </div>
    `;
}

async function submitResetPassword(event) {
    event.preventDefault();
    const password = document.getElementById('reset-password-new').value.trim();
    const confirmPassword = document.getElementById('reset-password-confirm').value.trim();
    const tokenParam = getResetTokenFromLocation();
    if (!tokenParam) {
        showToast('Reset token missing.', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'warning');
        return;
    }
    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'warning');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenParam, password })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            token = data.token;
            user = data.data.user;
            localStorage.setItem('fixentra_token', token);
            persistUserState();
            ensureUserProfileDefaults();
            showToast('Password reset successful. You are now logged in.', 'success');
            initUI();
            return;
        }
        showToast(data.message || 'Could not reset password.', 'error');
    } catch (err) {
        showToast('Could not reset password.', 'error');
    }
}

// ===== REGISTER VIEW =====
function renderRegister() {
    registerStep = 1;
    appContainer.innerHTML = `
        <div class="page-transition" style="position:relative;overflow:hidden;min-height:85vh;display:flex;align-items:center;justify-content:center;">
            <div class="orb orb-1" style="top:-10%;right:-10%;left:auto;background:rgba(16,185,129,0.3);"></div>
            <div class="orb orb-2" style="bottom:-10%;left:-10%;right:auto;background:rgba(245,158,11,0.25);"></div>
            <div style="position:absolute;top:0;left:0;right:0;"><div class="container"><div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Register</span></div></div></div>
            <div class="auth-container" style="max-width:600px;position:relative;z-index:10;width:100%;">
                <div class="summary-shell" style="margin-bottom:1.5rem;">
                    <div>
                        <p class="summary-label">3-step onboarding</p>
                        <h2 style="margin-bottom:0.35rem;background:linear-gradient(135deg,#0f172a 0%,#10b981 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Create Your Account</h2>
                        <p style="color:var(--text-muted);font-size:0.92rem;">Register faster on mobile and unlock saved homes, loyalty points, and repeat booking shortcuts.</p>
                    </div>
                    <div class="summary-price">3 steps</div>
                </div>

                <form onsubmit="handleAuth(event,'register')">
                    <div class="flow-stepper" style="margin-bottom:1.5rem;">
                        <button type="button" class="flow-step active" data-register-step="1" onclick="showRegisterStep(1)">1. You</button>
                        <button type="button" class="flow-step" data-register-step="2" onclick="showRegisterStep(2)">2. Contact</button>
                        <button type="button" class="flow-step" data-register-step="3" onclick="showRegisterStep(3)">3. Secure</button>
                    </div>

                    <section class="flow-panel active" data-register-panel="1">
                        <div class="form-split">
                            <div class="form-group"><label>Full Name</label><input type="text" id="reg-name" required placeholder="Vikram Kumar"></div>
                            <div class="form-group"><label>Email Address</label><input type="email" id="reg-email" required placeholder="vikram@example.in"></div>
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <select id="reg-role" required>
                                <option value="user">User (I want services)</option>
                                <option value="provider">Provider (I offer services)</option>
                            </select>
                        </div>
                        <div class="mini-grid">
                            <div class="mini-stat-card">
                                <span class="mini-stat-title">Why create an account?</span>
                                <strong>Faster repeat booking</strong>
                                <span class="mini-stat-meta">Saved homes, family profiles, and loyalty rewards</span>
                            </div>
                            <div class="mini-stat-card">
                                <span class="mini-stat-title">Extra trust</span>
                                <strong>Verified booking history</strong>
                                <span class="mini-stat-meta">Invoices, reviews, and live tracking in one place</span>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" onclick="nextRegisterStep()">Continue →</button>
                        </div>
                    </section>

                    <section class="flow-panel" data-register-panel="2">
                        <div class="form-group"><label>Address</label><input type="text" id="reg-address" required placeholder="Flat, building, street, city"></div>
                        <div class="form-group"><label>Phone Number</label><input type="text" id="reg-phone" required placeholder="+91 98765 43210"></div>
                        <div class="mini-grid">
                            <div class="mini-stat-card">
                                <span class="mini-stat-title">Saved Homes Ready</span>
                                <strong>Book for parents too</strong>
                                <span class="mini-stat-meta">A better fit for home-service use cases than generic signup</span>
                            </div>
                            <div class="mini-stat-card">
                                <span class="mini-stat-title">Hyperlocal support</span>
                                <strong>WhatsApp-first help</strong>
                                <span class="mini-stat-meta">Good for urgent electrical and plumbing follow-ups</span>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-ghost" onclick="prevRegisterStep()">← Back</button>
                            <button type="button" class="btn btn-primary" onclick="nextRegisterStep()">Continue →</button>
                        </div>
                    </section>

                    <section class="flow-panel" data-register-panel="3">
                        <div class="form-group"><label>Password</label><input type="password" id="reg-password" required minlength="6" placeholder="••••••••"></div>
                        <div class="form-group"><label>Referral Code (Optional)</label><input type="text" id="reg-referral" placeholder="e.g. FIX100"></div>
                        <div class="summary-list" style="margin-bottom:1.5rem;">
                            <div class="summary-row"><span>Rewards on signup</span><strong>Referral + wallet credit</strong></div>
                            <div class="summary-row"><span>Repeat UX</span><strong>Saved homes and family profiles</strong></div>
                            <div class="summary-row"><span>Support</span><strong>Live booking status + invoices</strong></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Create Account ✨</button>
                        <div style="margin:2rem 0;display:flex;align-items:center;gap:1rem;">
                            <hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;"><span style="color:var(--text-light);font-size:0.8rem;">OR</span><hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;">
                        </div>
                        <div id="google-reg-btn" style="display:flex;justify-content:center;"></div>
                        <p style="text-align:center;margin-top:1.5rem;color:var(--text-muted);">Already have an account? <a onclick="showView('login')" style="color:var(--primary);cursor:pointer;font-weight:600;">Login</a></p>
                        <div class="form-actions" style="margin-top:1rem;">
                            <button type="button" class="btn btn-ghost" onclick="prevRegisterStep()">← Back</button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    `;
    setTimeout(() => initGoogleLogin('google-reg-btn'), 200);
    showRegisterStep(1);
}

function showRegisterStep(step) {
    if (step > registerStep) {
        if (registerStep === 1 && !validateStepFields(['reg-name', 'reg-email', 'reg-role'])) return;
        if (registerStep === 2 && !validateStepFields(['reg-address', 'reg-phone'])) return;
    }
    registerStep = step;
    document.querySelectorAll('[data-register-step]').forEach(el => {
        el.classList.toggle('active', Number(el.dataset.registerStep) === step);
    });
    document.querySelectorAll('[data-register-panel]').forEach(el => {
        el.classList.toggle('active', Number(el.dataset.registerPanel) === step);
    });
}

function validateStepFields(ids) {
    return ids.every(id => {
        const element = document.getElementById(id);
        if (!element) return true;
        return element.reportValidity();
    });
}

function nextRegisterStep() {
    if (registerStep === 1 && !validateStepFields(['reg-name', 'reg-email', 'reg-role'])) return;
    if (registerStep === 2 && !validateStepFields(['reg-address', 'reg-phone'])) return;
    showRegisterStep(Math.min(registerStep + 1, 3));
}

function prevRegisterStep() {
    showRegisterStep(Math.max(registerStep - 1, 1));
}

// ===== #3 SERVICE FILTERS + #7 SKELETON + #8 DETAIL MODAL + #32 RECENTLY BOOKED + #35 VERIFIED =====
async function renderServices() {
    appContainer.innerHTML = `
        <div class="page-transition container" style="position:relative;padding-bottom:6rem;">
            <div class="orb orb-1" style="background:rgba(37,99,235,0.15);width:600px;height:600px;left:-200px;top:-100px;"></div>
            <div style="position:relative;z-index:10;">
                <div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Services</span></div>
                <div class="section-head" style="margin-top:1rem;">
                    <h2 style="font-size:3rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">${currentLang === 'en' ? 'Available Experts' : (currentLang === 'hi' ? 'उपलब्ध विशेषज्ञ' : 'मिस्त्री लोग के लिस्ट')}</h2>
                    <p style="color:var(--text-muted);font-size:1.1rem;margin-top:1rem;">${currentLang === 'en' ? 'Book top-rated professionals at upfront prices.' : (currentLang === 'hi' ? 'अग्रिम कीमतों पर शीर्ष रेटेड पेशेवरों को बुक करें।' : 'सही दाम पर सबसे नीमन मिस्त्री बुक करीं।')}</p>
                </div>

                <div class="mini-grid" style="margin-bottom:2rem;">
                    <div class="mini-stat-card">
                        <span class="mini-stat-title">Photo-based matching</span>
                        <strong>Upload issue evidence</strong>
                        <span class="mini-stat-meta">The booking flow now lets users attach a photo before they confirm.</span>
                    </div>
                    <div class="mini-stat-card">
                        <span class="mini-stat-title">Hyperlocal booking</span>
                        <strong>ETAs by neighborhood</strong>
                        <span class="mini-stat-meta">Choose your locality and the estimator updates with local expert speed.</span>
                    </div>
                </div>

                <div class="locality-pill-row" style="margin-bottom:1.5rem;">
                    ${localityInsights.map(item => `
                        <button class="locality-pill ${preferredLocality === item.name ? 'active' : ''}" onclick="selectLocalityAndBrowse('${item.name}')">
                            <span>${item.name}</span>
                            <strong>${item.eta}m</strong>
                        </button>
                    `).join('')}
                </div>

                <div class="filter-pills" id="filter-pills">
                    <button class="filter-pill active" onclick="filterServices('all', this)">All</button>
                    <button class="filter-pill" onclick="filterServices('cleaning', this)">🧹 Cleaning</button>
                    <button class="filter-pill" onclick="filterServices('electrician', this)">⚡ Electrician</button>
                    <button class="filter-pill" onclick="filterServices('plumber', this)">🔧 Plumber</button>
                    <button class="filter-pill" onclick="filterServices('carpenter', this)">🪚 Carpenter</button>
                    <button class="filter-pill" onclick="filterServices('appliance repair', this)">🔩 Appliance</button>
                    <button class="filter-pill" onclick="filterServices('painter', this)">🎨 Painter</button>
                    <button class="filter-pill" onclick="filterServices('pest control', this)">🐜 Pest Control</button>
                </div>

                <div style="margin-bottom:3rem;">
                    <h3 style="margin-bottom:1.5rem;font-size:1.5rem;color:var(--text);">🔥 Patna Exclusive Combos</h3>
                    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <div class="card" style="background:var(--primary-light);border:1px solid var(--primary);animation:fadeIn 0.5s ease-out;">
                            <div class="verified-badge" style="background:var(--primary);color:white;width:fit-content;margin-bottom:1rem;">Save 25%</div>
                            <h4 style="font-size:1.2rem;margin-bottom:0.5rem;color:var(--primary);">Deep Clean + Pest Control</h4>
                            <p style="color:var(--text);font-size:0.9rem;opacity:0.8;margin-bottom:1rem;">Complete home reset package for Patna apartments.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <p class="card-price" style="color:var(--primary);">₹3,499</p>
                                <button class="btn btn-primary" onclick="openComboBooking('deep_combo')">Book Combo</button>
                            </div>
                        </div>
                        <div class="card" style="background:#fef3c7;border:1px solid #f59e0b;animation:fadeIn 0.6s ease-out;">
                            <div class="verified-badge" style="background:#f59e0b;color:white;width:fit-content;margin-bottom:1rem;">Save 15%</div>
                            <h4 style="font-size:1.2rem;margin-bottom:0.5rem;color:#d97706;">AC Service + Plumber Scan</h4>
                            <p style="color:var(--text);font-size:0.9rem;opacity:0.8;margin-bottom:1rem;">Summer ready AC tune-up with full pipe inspection.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <p class="card-price" style="color:#d97706;">₹999</p>
                                <button class="btn btn-primary" style="background:#f59e0b;" onclick="openComboBooking('summer_combo')">Book Combo</button>
                            </div>
                        </div>
                        <div class="card" style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);animation:fadeIn 0.7s ease-out;">
                            <div class="verified-badge" style="background:var(--secondary);color:white;width:fit-content;margin-bottom:1rem;">Family Favourite</div>
                            <h4 style="font-size:1.2rem;margin-bottom:0.5rem;color:var(--secondary);">Parents Home Check-In</h4>
                            <p style="color:var(--text);font-size:0.9rem;opacity:0.8;margin-bottom:1rem;">Book plumbing or electrical checks for parents using saved family profiles.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <p class="card-price" style="color:var(--secondary);">₹699</p>
                                <button class="btn btn-primary" style="background:var(--secondary);" onclick="openComboBooking('family_support')">Use Flow</button>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 style="margin-bottom:1.5rem;font-size:1.5rem;color:var(--text);">All Services</h3>
                <div class="grid" id="services-grid">
                    ${Array(4).fill(0).map(() => `<div class="card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%;"></div><div class="skeleton skeleton-text" style="width:90%;margin-top:1rem;height:60px;"></div><div class="skeleton skeleton-text" style="width:50%;margin-top:1rem;"></div></div>`).join('')}
                </div>
            </div>
        </div>`;

    try {
        await ensurePublicProvidersLoaded({ force: true, silent: true });
        const loaded = await ensureServicesLoaded({ force: true });
        if (!loaded) {
            throw new Error('Service catalog unavailable');
        }
        renderServiceCards(allServices);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('services-grid').innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Could not load services. Make sure the backend is running at ${API_URL}.</p>`;
    }
}

function renderServiceCards(services) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    if (!services.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No services match this filter.</p>'; return; }
    const booked = [32, 18, 24, 15, 9, 21, 12];
    grid.innerHTML = services.map((s, i) => {
        const availability = getServiceAvailability(s, i);
        const expert = getExpertForService(s, i);
        const included = getServiceIncluded(s).slice(0, 2);
        return `
        <div class="card service-browser-card" style="animation:cardStagger 0.5s ease-out ${i * 0.1}s both;">
            <div class="service-card-media tall">
                <img src="${getServicePrimaryImage(s)}" alt="${s.name}">
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
                <div class="card-category">${s.category}</div>
                <div class="verified-badge" style="background:linear-gradient(135deg,#f59e0b20,#ef444420);color:var(--accent);border:1px solid #f59e0b40;font-weight:700;"><span style="margin-right:4px;">🏆</span>Top Rated in ${availability.topLocality}</div>
            </div>
            <h3 class="card-title" style="margin-top:0.75rem;">${s.name}</h3>
            <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.25rem;">${s.description || 'Professional service.'}</p>
            <div class="service-meta-list" style="margin-bottom:1rem;">
                <span>⏱️ ${availability.etaMins} min ETA</span>
                <span>👷 ${availability.activeExperts} experts</span>
                <span>📍 ${availability.topLocality}</span>
                <span>🧑 ${expert.name}</span>
            </div>
            <div class="chip-row" style="margin-bottom:1rem;">
                ${included.map(item => `<span class="chip muted-chip">${item}</span>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
                <p class="card-price">₹${s.price.toLocaleString()}</p>
                <button class="btn btn-primary" onclick="event.stopPropagation();openBookingModal('${s._id}','${s.name.replace(/'/g, "\\'")}')">Book Now</button>
            </div>
            <div class="recently-booked">${booked[i % booked.length]} booked today</div>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:0.75rem;">
                <p style="font-size:0.75rem;color:var(--primary);cursor:pointer;font-weight:600;" onclick="event.stopPropagation();showServiceDetail('${s._id}')">View Details →</p>
                <p style="font-size:0.75rem;color:var(--secondary);cursor:pointer;font-weight:600;" onclick="event.stopPropagation();openExpertProfile('${expert.id}')">View Expert →</p>
            </div>
        </div>
    `;
    }).join('');
}

function filterServices(category, triggerButton) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    if (triggerButton) triggerButton.classList.add('active');
    const filtered = category === 'all' ? allServices : allServices.filter(s => s.category === category);
    renderServiceCards(filtered);
}

// ===== #8 SERVICE DETAIL MODAL =====
function showServiceDetail(id) {
    const s = allServices.find(x => x._id === id);
    if (!s) return;
    const expert = getExpertForService(s);
    const availability = getServiceAvailability(s);
    const gallery = getServiceGallery(s);
    const included = getServiceIncluded(s);
    const content = document.getElementById('service-detail-content');
    content.innerHTML = `
        <div class="service-detail-shell">
            <div class="service-card-media tall detail-media">
                <img src="${gallery[0]}" alt="${s.name}">
            </div>
            <div style="text-align:center;margin:1.5rem 0 2rem;">
                <div class="card-category" style="font-size:0.85rem;">${s.category}</div>
                <h2 style="margin-top:0.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">${s.name}</h2>
            </div>
        </div>
        <p style="color:var(--text-muted);line-height:1.8;margin-bottom:1.5rem;">${s.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem;">
            <div style="background:var(--primary-light);padding:1rem;border-radius:var(--radius-sm);text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Price</p><p style="font-size:1.5rem;font-weight:800;color:var(--primary);">₹${s.price.toLocaleString()}</p></div>
            <div style="background:var(--secondary-light);padding:1rem;border-radius:var(--radius-sm);text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Local ETA</p><p style="font-size:1.5rem;font-weight:800;color:var(--secondary);">${availability.etaMins} mins</p></div>
        </div>
        <div class="service-gallery-strip">
            ${gallery.map(image => `<img src="${image}" alt="${s.name} gallery image">`).join('')}
        </div>
        <div class="service-included-list">
            ${included.map(item => `<div class="service-included-item">✓ ${item}</div>`).join('')}
        </div>
        <div class="mini-grid" style="margin-bottom:1.5rem;">
            <div class="mini-stat-card">
                <span class="mini-stat-title">Active experts</span>
                <strong>${availability.activeExperts}</strong>
                <span class="mini-stat-meta">${availability.topLocality} currently has the best routing match</span>
            </div>
            <div class="mini-stat-card">
                <span class="mini-stat-title">Live demand</span>
                <strong>${availability.jobsToday} jobs today</strong>
                <span class="mini-stat-meta">Photo upload and locality selection improve matching speed</span>
            </div>
        </div>
        <div class="mini-stat-card" style="margin-bottom:1.5rem;">
            <span class="mini-stat-title">Recommended Expert</span>
            <strong>${expert.name}</strong>
            <span class="mini-stat-meta">${expert.role} · ${expert.rating} rating · ${expert.area}</span>
            <button class="btn btn-outline" style="margin-top:1rem;width:100%;" onclick="openExpertProfile('${expert.id}')">View Expert Profile</button>
        </div>
        <div style="background:#fefce8;padding:1rem;border-radius:var(--radius-sm);margin-bottom:2rem;font-size:0.85rem;color:#854d0e;">🛡️ This service includes a 30-day rework guarantee, transparent pricing, and a verified professional.</div>
        <button class="btn btn-primary btn-lg" style="width:100%;" onclick="closeModal('service-detail-modal');openBookingModal('${s._id}','${s.name.replace(/'/g, "\\'")}')">Book This Service ✨</button>
    `;
    document.getElementById('service-detail-modal').style.display = 'flex';
}

// ===== DASHBOARD + #21 STATS + #5 TIMELINE + #23 ACTIVITY =====
async function renderDashboard() {
    if (!token) return showView('login');
    appContainer.innerHTML = `
        <div class="page-transition container" style="margin-top:2rem;position:relative;padding-bottom:6rem;">
            <div class="orb orb-1" style="top:-100px;left:300px;background:rgba(245,158,11,0.12);"></div>
            <div style="position:relative;z-index:10;">
                <div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Dashboard</span></div>
                <div class="stats-grid" id="stats-grid">
                    <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-value" id="stat-total">-</div><div class="stat-label">Total Bookings</div></div>
                    <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-value" id="stat-pending" style="color:var(--accent);">-</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value" id="stat-completed" style="color:var(--secondary);">-</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-value" style="color:var(--accent);">4.8</div><div class="stat-label">Avg Rating</div></div>
                </div>
                <div class="mini-grid" style="margin-bottom:2rem;">
                    <div class="mini-stat-card">
                        <span class="mini-stat-title">Loyalty Status</span>
                        <strong>${user.loyaltyTier || 'Priority Gold'}</strong>
                        <span class="mini-stat-meta">${user.loyaltyPoints || 0} points · ${user.loyaltyStreak || 0}-service streak</span>
                    </div>
                    <div class="mini-stat-card">
                        <span class="mini-stat-title">Saved Properties</span>
                        <strong>${savedAddresses.length} homes</strong>
                        <span class="mini-stat-meta">${familyProfiles.length} family profiles ready for quick booking</span>
                    </div>
                </div>
                <div class="dashboard-grid">
                    <div class="sidebar">
                        <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(0,0,0,0.05);">
                            <div class="sidebar-avatar">${user.profileImage && !String(user.profileImage).includes('default.png') ? `<img src="${normalizeImageSrc(user.profileImage)}" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}</div>
                            <h3 style="margin-bottom:0.25rem;">${user.name}</h3>
                            <p style="font-size:0.8rem;color:var(--primary);text-transform:capitalize;font-weight:600;">${user.role} Account</p>
                        </div>
                        <div class="card" style="margin-bottom:2rem;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;">
                            <p style="font-size:0.75rem;opacity:0.8;margin-bottom:0.5rem;">Wallet Balance</p>
                            <h3 style="font-size:1.5rem;" id="wallet-balance-display">₹${user.walletBalance || 0}</h3>
                            <button class="btn" style="width:100%;margin-top:1rem;background:rgba(255,255,255,0.2);color:white;font-size:0.75rem;" onclick="triggerRazorpayMock()">💳 Top Up via Razorpay</button>
                        </div>
                        <div class="loyalty-card" style="margin-bottom:2rem;">
                            <p class="loyalty-tier">${user.loyaltyTier || 'Priority Gold'}</p>
                            <div class="loyalty-points">${user.loyaltyPoints || 240}</div>
                            <p style="max-width:220px;position:relative;z-index:1;">Keep booking to unlock faster expert assignment and member-only pricing.</p>
                            <div class="streak-bar">
                                ${Array.from({ length: 7 }, (_, index) => `<div class="streak-day ${index < Math.min(user.loyaltyStreak || 6, 6) ? 'active' : ''} ${index === Math.min((user.loyaltyStreak || 6) - 1, 6) ? 'current' : ''}"></div>`).join('')}
                            </div>
                        </div>
                        <div class="card" style="margin-bottom:2rem;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                                <h4>Saved Homes</h4>
                                <button class="btn btn-ghost" style="padding:0.45rem 0.8rem;font-size:0.75rem;" onclick="openHomesManager()">Manage</button>
                            </div>
                            <div class="summary-list">
                                ${savedAddresses.slice(0, 2).map(home => `<div class="summary-row"><span>${home.label}</span><strong>${home.locality}</strong></div>`).join('')}
                            </div>
                        </div>
                        <ul class="sidebar-nav">
                            <li class="active">📊 Dashboard</li>
                            <li onclick="showReferralModal()">🎁 Refer & Earn</li>
                            <li onclick="openPlanModal('${(user.subscriptionPlan || 'Family Shield').replace(/'/g, "\\'")}')">🛡️ ${user.subscriptionPlan || 'Family Shield'}</li>
                            <li onclick="openPastDealsModal()">📜 Past Deals</li>
                            <li onclick="openSettingsModal()">⚙️ Settings</li>
                        </ul>
                    </div>
                    <div>
                        <h2 style="font-size:2rem;margin-bottom:2rem;">${user.role === 'provider' ? 'Assigned Jobs' : user.role === 'admin' ? 'All Bookings (Admin)' : 'Your Bookings'}</h2>
                        <!-- #7 Skeleton -->
                        <div class="grid" id="bookings-list">
                            ${Array(3).fill(0).map(() => `<div class="card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:60%;"></div><div class="skeleton skeleton-text" style="width:80%;margin-top:1rem;height:40px;"></div></div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    let endpoint = '/api/bookings/history';
    if (user.role === 'provider') endpoint = '/api/bookings/jobs';
    else if (user.role === 'admin') endpoint = '/api/bookings';

    const bookingsList = document.getElementById('bookings-list');
    try {
        const response = await fetch(`${API_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        const bookings = user.role === 'admin' ? data.data.bookings : (user.role === 'provider' ? data.data.jobs : data.data.bookings);

        // Stats
        const total = bookings ? bookings.length : 0;
        const pending = bookings ? bookings.filter(b => ['pending','assigned','accepted'].includes(b.status)).length : 0;
        const completed = bookings ? bookings.filter(b => b.status === 'completed').length : 0;
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-completed').textContent = completed;

        if (!bookings || bookings.length === 0) {
            bookingsList.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><p style="font-size:4rem;margin-bottom:1rem;">📭</p><h3>No bookings yet</h3><p style="color:var(--text-muted);margin-top:0.5rem;">Book your first service to get started!</p><button class="btn btn-primary" style="margin-top:1.5rem;" onclick="showView('services')">Browse Services</button></div>`;
            return;
        }

        // #5 Timeline statuses
        const statusOrder = ['pending','assigned','accepted','completed'];
        bookingsList.innerHTML = bookings.map(b => {
            const statusIdx = statusOrder.indexOf(b.status);
            const isProvider = user.role === 'provider';
            const savedHome = savedAddresses.find(item => b.address && b.address.includes(item.address));
            const serviceImage = getServicePrimaryImage(b.serviceId || {});
            const issueImage = normalizeImageSrc(b.issuePhotoUrl);
            const providerImage = normalizeImageSrc(b.providerId?.profileImage);
            return `
            <div class="card" style="position:relative;overflow:hidden;">
                ${(b.status === 'assigned' || b.status === 'accepted') ? `
                <div class="map-simulation" style="height:100px;background:#eef2ff;margin:-2.5rem -2.5rem 1.5rem -2.5rem;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    <div class="radar-ping"></div>
                    <div style="z-index:2;text-align:center;">
                        <p style="font-size:0.7rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:1px;">Expert On The Way 📍</p>
                        <p style="font-size:0.6rem;color:var(--text-muted);">ETA: ${b.estimatedArrivalMins || 12} mins</p>
                    </div>
                    <div style="position:absolute;width:100%;height:100%;background:repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(79,70,229,0.05) 20px,rgba(79,70,229,0.05) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(79,70,229,0.05) 20px,rgba(79,70,229,0.05) 21px);"></div>
                </div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <span class="card-category">${b.serviceId?.category || 'Service'}</span>
                    <span style="font-size:0.75rem;background:${b.status==='completed'?'var(--secondary-light)':b.status==='rejected'?'#fee2e2':'var(--primary-light)'};color:${b.status==='completed'?'var(--secondary)':b.status==='rejected'?'var(--danger)':'var(--primary)'};padding:3px 10px;border-radius:var(--radius-full);font-weight:600;text-transform:capitalize;">${b.status}</span>
                </div>
                <h3 class="card-title">${b.serviceId?.name || 'Service'}</h3>
                <div class="dashboard-media-row">
                    <img class="dashboard-image-thumb" src="${serviceImage}" alt="${b.serviceId?.name || 'Service'}">
                    ${issueImage ? `<img class="dashboard-image-thumb" src="${issueImage}" alt="Uploaded issue">` : ''}
                    ${providerImage ? `<img class="dashboard-image-thumb" src="${providerImage}" alt="${b.providerId?.name || 'Assigned provider'}">` : ''}
                </div>
                <p style="font-size:0.85rem;color:var(--text-muted);">📅 ${new Date(b.date).toDateString()}</p>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;">🕒 ${b.timeSlot}</p>
                <p style="font-size:0.85rem;">📍 ${b.address}</p>
                ${savedHome ? `<p style="font-size:0.8rem;color:var(--primary);margin-top:0.4rem;">🏠 Saved property: ${savedHome.label}</p>` : ''}
                ${b.familyProfile ? `<p style="font-size:0.8rem;color:var(--secondary);margin-top:0.4rem;">👤 Booking for: ${b.familyProfile}</p>` : ''}
                ${b.issueNote ? `<p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.75rem;">📝 ${b.issueNote}</p>` : ''}
                ${b.providerId?.name ? `<p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.55rem;">👷 Assigned: ${b.providerId.name}</p>` : ''}

                <div class="timeline" style="margin-top:1.25rem;">
                    <div class="timeline-line"><div class="timeline-line-fill" style="width:${Math.max(0, statusIdx) / (statusOrder.length - 1) * 100}%;"></div></div>
                    ${statusOrder.map((st, i) => `<div class="timeline-step ${i < statusIdx ? 'done' : i === statusIdx ? 'active' : ''}"><div class="timeline-dot">${i < statusIdx ? '✓' : i === statusIdx ? '●' : ''}</div><div class="timeline-label">${st}</div></div>`).join('')}
                </div>

                <div style="display:flex;gap:0.5rem;margin-top:1.5rem;">
                    ${(b.status !== 'completed' && b.status !== 'rejected' && b.status !== 'cancelled') ? `
                        <button class="btn btn-ghost" style="flex:1;padding:0.5rem;" onclick="openChat('${b._id}','${isProvider ? (b.userId?.name || 'Customer') : (b.providerId?.name || 'Expert')}')">💬 Chat</button>
                    ` : ''}
                    ${(!isProvider && (b.status === 'pending' || b.status === 'assigned')) ? `
                        <button class="btn btn-outline" style="flex:1;padding:0.5rem;border-color:var(--danger);color:var(--danger);" onclick="cancelBooking('${b._id}')">✕ Cancel</button>
                    ` : ''}
                    ${b.status === 'completed' ? `
                        <button class="btn btn-outline" style="flex:1;padding:0.5rem;border-color:var(--secondary);color:var(--secondary);" onclick="downloadInvoice('${b._id}')">🧾 Invoice</button>
                    ` : ''}
                    ${(b.status === 'completed' && !isProvider) ? `
                        <button class="btn btn-primary" style="flex:1;padding:0.5rem;" onclick="openReviewModal('${b.providerId?._id}', '${b.serviceId?.name}')">⭐ Review</button>
                    ` : ''}
                </div>

                ${(b.status === 'completed' && !isProvider) ? `
                    <button class="btn btn-ghost" style="width:100%;margin-top:0.9rem;" onclick="rebookService('${b.serviceId?._id || ''}','${(b.serviceId?.name || 'Service').replace(/'/g, "\\'")}','${(b.locality || 'Patna').replace(/'/g, "\\'")}','${(b.address || '').replace(/'/g, "\\'")}', '${(b.familyProfile || '').replace(/'/g, "\\'")}')">🔁 Rebook This Service</button>
                ` : ''}

                ${(isProvider && b.status === 'assigned') ? `<div style="margin-top:1.25rem;display:flex;gap:0.5rem;"><button class="btn btn-success" style="flex:1;" onclick="updateBooking('${b._id}','accepted')">Accept ✓</button><button class="btn btn-danger" style="flex:1;" onclick="updateBooking('${b._id}','rejected')">Reject ✕</button></div>` : ''}
                ${(isProvider && b.status === 'accepted') ? `<button class="btn btn-primary" style="width:100%;margin-top:1rem;" onclick="updateBooking('${b._id}','completed')">Mark Completed ✅</button>` : ''}
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Dashboard error:', err);
        bookingsList.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Could not load bookings.</p>`;
    }
}

async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.status === 'success') {
            showToast('Booking cancelled successfully', 'success');
            renderDashboard(); // Refresh UI
        } else {
            showToast(data.message || 'Failed to cancel booking.', 'error');
        }
    } catch (err) {
        showToast('Error cancelling booking.', 'error');
    }
}

// ===== AUTH LOGIC =====
async function handleAuth(event, type) {
    event.preventDefault();
    const isRegister = type === 'register';
    const payload = isRegister ? {
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim().toLowerCase(),
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        address: document.getElementById('reg-address').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        referralCode: document.getElementById('reg-referral').value.trim()
    } : {
        email: document.getElementById('login-email').value.trim().toLowerCase(),
        password: document.getElementById('login-password').value
    };

    if (isRegister) {
        const btn = event.submitter || event.target.querySelector('button[type="submit"]');
        const originalText = btn?.innerHTML;
        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = 'Sending verification code...';
            }
            await requestRegisterOtp(payload);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText || 'Create Account ✨';
            }
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.status === 'success') {
            localStorage.setItem('fixentra_token', data.token);
            localStorage.setItem('fixentra_user', JSON.stringify(data.data.user));
            user = data.data.user;
            token = data.token;
            showToast(`Welcome back, ${user.name}! 🎉`, 'success');
            initUI();
        } else {
            showToast(data.message || 'Authentication failed.', 'error');
        }
    } catch (err) {
        showToast('Connection failed. Is the server running?', 'error');
    }
}

function sanitizeOtpInput(input) {
    if (input) {
        input.value = input.value.replace(/\D/g, '').slice(0, 6);
    }
}

function openOtpModal({ recipient, otpPreview, deliveryMode }) {
    const helpText = document.getElementById('otp-help-text');
    const otpInput = document.getElementById('otp-code');
    const previewBanner = document.getElementById('otp-preview-banner');
    if (helpText) {
        helpText.textContent = `Enter the 6-digit code sent to ${recipient} to complete registration.`;
    }
    if (otpInput) {
        otpInput.value = '';
    }
    if (previewBanner) {
        if (otpPreview) {
            previewBanner.style.display = 'block';
            previewBanner.innerHTML = `Demo delivery mode is active. Your current verification code is <strong>${otpPreview}</strong>.`;
        } else {
            previewBanner.style.display = 'block';
            previewBanner.textContent = deliveryMode === 'email'
                ? 'Verification email sent. Check inbox and spam if it does not arrive immediately.'
                : 'Verification code sent successfully.';
        }
    }
    document.getElementById('otp-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('otp-code')?.focus(), 120);
}

async function requestRegisterOtp(payload, isResend = false) {
    try {
        const response = await fetch(`${API_URL}/api/auth/request-register-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                password: payload.password
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            window.pendingRegPayload = {
                ...payload,
                verificationToken: data.data.verificationToken
            };
            openOtpModal(data.data);
            showToast(isResend ? 'A fresh verification code has been sent.' : `Verification code sent to ${data.data.recipient}.`, 'success');
            return true;
        }
        const message = data.message || data.errors?.[0]?.msg || 'Could not send verification code.';
        showToast(message, 'error');
        return false;
    } catch (err) {
        showToast('Could not send verification code right now.', 'error');
        return false;
    }
}

async function resendRegisterOTP() {
    if (!window.pendingRegPayload) {
        showToast('Start registration again to request a new code.', 'warning');
        closeModal('otp-modal');
        showView('register');
        return;
    }
    await requestRegisterOtp(window.pendingRegPayload, true);
}

async function verifyOTP() {
    const btn = document.getElementById('otp-verify-btn');
    const otpInput = document.getElementById('otp-code');
    const verificationCode = otpInput?.value?.trim() || '';
    const payload = window.pendingRegPayload;

    if (!payload?.verificationToken) {
        showToast('Verification session expired. Please request a new code.', 'warning');
        closeModal('otp-modal');
        showView('register');
        return;
    }
    if (verificationCode.length !== 6) {
        showToast('Enter the 6-digit verification code.', 'warning');
        otpInput?.focus();
        return;
    }

    const originalText = btn?.innerHTML;
    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Verifying...';
        }
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payload,
                verificationCode,
                verificationToken: payload.verificationToken
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            localStorage.setItem('fixentra_token', data.token);
            localStorage.setItem('fixentra_user', JSON.stringify(data.data.user));
            user = data.data.user;
            token = data.token;
            window.pendingRegPayload = null;
            showToast(`Welcome to Fixentra, ${user.name}! ✨`, 'success');
            triggerConfetti();
            closeModal('otp-modal');
            initUI();
            return;
        }
        showToast(data.message || data.errors?.[0]?.msg || 'Registration failed.', 'error');
    } catch (err) {
        showToast('Registration failed.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText || 'Verify & Register →';
        }
    }
}

function logout() {
    localStorage.removeItem('fixentra_token');
    localStorage.removeItem('fixentra_user');
    user = null; token = null;
    showToast('Logged out successfully.', 'info');
    initUI();
}

// ===== BOOKING =====
function getStandardTimeSlots() {
    return [
        '08:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 02:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM',
        '06:00 PM - 08:00 PM'
    ];
}

function populateBookingHelpers() {
    const homeSelect = document.getElementById('booking-home-select');
    const familySelect = document.getElementById('booking-family-profile');
    if (homeSelect) {
        homeSelect.innerHTML = `<option value="">Choose a saved property</option>${savedAddresses.map(home => `<option value="${home.id}">${home.label} · ${home.locality}</option>`).join('')}`;
    }
    if (familySelect) {
        familySelect.innerHTML = `<option value="">Select a profile</option>${familyProfiles.map(profile => `<option value="${profile.id}">${profile.label}</option>`).join('')}`;
        familySelect.value = 'self';
    }
}

function applySavedHomeToBooking() {
    const homeId = document.getElementById('booking-home-select')?.value;
    const home = savedAddresses.find(item => item.id === homeId);
    if (!home) return;
    document.getElementById('booking-locality').value = home.locality;
    document.getElementById('booking-address').value = home.address;
    preferredLocality = home.locality;
    updateBookingSummary();
    showToast(`Loaded ${home.label}`, 'info');
}

function saveCurrentAddress() {
    const locality = document.getElementById('booking-locality').value;
    const address = document.getElementById('booking-address').value.trim();
    if (!locality || !address) {
        showToast('Add locality and address before saving a property.', 'warning');
        return;
    }
    const profile = familyProfiles.find(item => item.id === document.getElementById('booking-family-profile').value);
    const label = profile ? `${profile.label} Home` : `Saved Home ${savedAddresses.length + 1}`;
    const existing = savedAddresses.find(item => item.address === address && item.locality === locality);
    if (existing) {
        document.getElementById('booking-home-select').value = existing.id;
        showToast('This property is already saved.', 'info');
        return;
    }
    const newHome = { id: `home-${Date.now()}`, label, locality, address };
    savedAddresses = [newHome, ...savedAddresses].slice(0, 8);
    writeStoredJSON('fixentra_saved_addresses', savedAddresses);
    populateBookingHelpers();
    document.getElementById('booking-home-select').value = newHome.id;
    showToast(`${label} saved for faster rebooking.`, 'success');
}

function setBookingMode(mode) {
    bookingMode = mode;
    const input = document.getElementById('booking-mode');
    const banner = document.getElementById('booking-priority-banner');
    const slotSelect = document.getElementById('booking-timeslot');
    if (input) input.value = mode;
    if (slotSelect) {
        const emergencySlots = [
            'Immediate Arrival (Next 30 mins)',
            'Express Visit (Within 90 mins)',
            'Priority Today (2-4 hours)'
        ];
        const slots = mode === 'emergency' ? emergencySlots : getStandardTimeSlots();
        slotSelect.innerHTML = `<option value="">Choose a time slot</option>${slots.map(slot => `<option value="${slot}">${slot}</option>`).join('')}`;
        if (mode === 'emergency') {
            slotSelect.value = emergencySlots[0];
        }
    }
    if (banner) {
        if (mode === 'emergency') {
            banner.style.display = 'block';
            banner.innerHTML = '⚡ Emergency priority active. Faster routing and a 50% emergency surcharge will be applied at confirmation.';
        } else {
            banner.style.display = 'none';
            banner.innerHTML = '';
        }
    }
    if (mode === 'emergency') {
        document.getElementById('booking-date').value = new Date().toISOString().split('T')[0];
    }
    updateBookingSummary();
}

function showBookingStep(step) {
    if (step > bookingStep) {
        if (bookingStep === 1 && !validateStepFields(['booking-locality'])) return;
        if (bookingStep === 2 && !validateStepFields(['booking-address', 'booking-payment-method', 'booking-date', 'booking-timeslot'])) return;
    }
    bookingStep = step;
    document.querySelectorAll('[data-step-panel]').forEach(panel => {
        panel.classList.toggle('active', Number(panel.dataset.stepPanel) === step);
    });
    document.querySelectorAll('#booking-stepper .flow-step').forEach(stepButton => {
        stepButton.classList.toggle('active', Number(stepButton.dataset.step) === step);
    });
    updateBookingSummary();
}

function nextBookingStep() {
    if (bookingStep === 1 && !validateStepFields(['booking-locality'])) return;
    if (bookingStep === 2 && !validateStepFields(['booking-address', 'booking-payment-method', 'booking-date', 'booking-timeslot'])) return;
    showBookingStep(Math.min(bookingStep + 1, 3));
}

function prevBookingStep() {
    showBookingStep(Math.max(bookingStep - 1, 1));
}

function handleBookingPhotoChange() {
    const input = document.getElementById('booking-photo');
    const label = document.getElementById('booking-photo-label');
    const fileName = document.getElementById('booking-photo-name');
    bookingIssuePhotoName = input?.files?.[0]?.name || '';
    if (label) label.textContent = bookingIssuePhotoName || 'Upload a photo for faster expert matching';
    if (fileName) fileName.textContent = bookingIssuePhotoName ? `Selected: ${bookingIssuePhotoName}` : '';
}

function updateBookingSummary() {
    const service = getActiveService();
    if (service) {
        activeBookingBasePrice = service.price;
        activeBookingServiceName = service.name;
    }

    const localityValue = document.getElementById('booking-locality')?.value || preferredLocality || '';
    const locality = localityValue ? getLocalityInsight(localityValue) : null;
    const family = familyProfiles.find(item => item.id === document.getElementById('booking-family-profile')?.value);
    const home = savedAddresses.find(item => item.id === document.getElementById('booking-home-select')?.value);
    const paymentMethod = document.getElementById('booking-payment-method')?.value || 'cash';
    const dateValue = document.getElementById('booking-date')?.value;
    const timeSlot = document.getElementById('booking-timeslot')?.value || 'Choose a slot';
    const discountAmount = activeBookingBasePrice * (currentDiscount / 100);
    const discountedBase = activeBookingBasePrice - discountAmount;
    const emergencySurcharge = bookingMode === 'emergency' ? discountedBase * 0.5 : 0;
    const total = discountedBase + emergencySurcharge;

    const localizedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pick a date';
    const familyLabel = family?.label || 'For Me';
    const homeLabel = home?.label || (document.getElementById('booking-address')?.value ? 'Custom address' : 'Choose a property');

    const assignments = [
        ['booking-service-name', activeBookingServiceName || 'Selected service'],
        ['booking-starting-price', formatCurrency(total || activeBookingBasePrice || 0)],
        ['booking-locality-eta', locality ? `${locality.eta} mins` : 'Choose locality'],
        ['booking-locality-experts', locality ? `${locality.experts} experts nearby` : 'Verified experts update here'],
        ['booking-locality-demand', locality ? `${locality.jobsToday} jobs today` : 'Neighborhood activity'],
        ['booking-locality-rating', locality ? `${locality.rating} local rating • ${locality.savings} avg savings` : 'Ratings and repeat rate'],
        ['booking-summary-title', activeBookingServiceName ? `Review ${activeBookingServiceName}` : 'Review your booking'],
        ['booking-estimated-total', formatCurrency(total || 0)],
        ['booking-summary-service', activeBookingServiceName || '-'],
        ['booking-summary-family', `${homeLabel} · ${familyLabel}`],
        ['booking-summary-visit', `${localizedDate} · ${timeSlot}`],
        ['booking-summary-payment', paymentMethod === 'online' ? 'Online payment' : 'Cash after service'],
        ['booking-summary-discount', currentDiscount ? `-${formatCurrency(discountAmount)} (${currentDiscount}% off)` : 'No coupon'],
        ['booking-summary-priority', bookingMode === 'emergency' ? `Emergency (+${formatCurrency(emergencySurcharge)})` : 'Standard'],
        ['booking-summary-eta', locality ? `${locality.eta} mins in ${locality.name}` : '-']
    ];
    assignments.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

async function openBookingModal(id, name, emergency = false) {
    if (!token) {
        showToast('Please login to book a service.', 'warning');
        return showView('login');
    }
    const loaded = await ensureServicesLoaded();
    if (!loaded) return;

    const form = document.getElementById('booking-form');
    form.reset();
    currentCouponCode = null;
    currentDiscount = 0;
    bookingIssuePhotoName = '';
    bookingStep = 1;

    const service = allServices.find(item => item._id === id);
    activeBookingServiceName = name;
    activeBookingBasePrice = service?.price || 0;

    document.getElementById('modal-service-id').value = id;
    document.getElementById('modal-provider-id').value = '';
    document.getElementById('modal-title').innerText = emergency ? `Priority Booking: ${name}` : `Book: ${name}`;
    document.getElementById('booking-date').min = new Date().toISOString().split('T')[0];
    document.getElementById('coupon-message').textContent = '';
    document.getElementById('booking-photo-name').textContent = '';
    document.getElementById('booking-photo-label').textContent = 'Upload a photo for faster expert matching';

    populateBookingHelpers();
    if (savedAddresses[0]) {
        document.getElementById('booking-home-select').value = savedAddresses[0].id;
        document.getElementById('booking-address').value = savedAddresses[0].address;
    }
    if (preferredLocality) {
        document.getElementById('booking-locality').value = preferredLocality;
    } else if (savedAddresses[0]) {
        document.getElementById('booking-locality').value = savedAddresses[0].locality;
    }

    setBookingMode(emergency ? 'emergency' : 'standard');
    showBookingStep(1);
    updateBookingSummary();
    document.getElementById('booking-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

let currentCouponCode = null;
let currentDiscount = 0;

function buildBookingFormData(bookingPayload) {
    const formData = new FormData();
    Object.entries(bookingPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });
    const issuePhoto = document.getElementById('booking-photo')?.files?.[0];
    if (issuePhoto) {
        formData.append('issuePhoto', issuePhoto);
    }
    return formData;
}

async function createBookingRequest(bookingPayload) {
    const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: buildBookingFormData(bookingPayload)
    });
    return response.json();
}

async function applyCoupon() {
    const code = document.getElementById('booking-coupon').value.trim().toUpperCase();
    const msg = document.getElementById('coupon-message');
    if (!code) { msg.innerText = 'Please enter a code'; msg.style.color = 'var(--danger)'; return; }

    msg.innerText = 'Validating...'; msg.style.color = '#888';

    try {
        const res = await fetch(`${API_URL}/api/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.status === 'success') {
            currentDiscount = data.data.discount;
            currentCouponCode = code;
            msg.innerText = `✅ ${currentDiscount}% discount applied!`;
            msg.style.color = 'var(--success)';
        } else {
            msg.innerText = `❌ ${data.message || 'Invalid coupon'}`;
            msg.style.color = 'var(--danger)';
            currentDiscount = 0;
            currentCouponCode = null;
        }
    } catch (err) {
        msg.innerText = `❌ Error applying coupon`;
        msg.style.color = 'var(--danger)';
        currentDiscount = 0;
        currentCouponCode = null;
    }
    updateBookingSummary();
}

['booking-locality', 'booking-payment-method', 'booking-date', 'booking-timeslot', 'booking-family-profile'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('change', updateBookingSummary);
});
['booking-address', 'booking-issue'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('input', updateBookingSummary);
});
const bookingHomeSelect = document.getElementById('booking-home-select');
if (bookingHomeSelect) bookingHomeSelect.addEventListener('change', applySavedHomeToBooking);
const bookingPhotoInput = document.getElementById('booking-photo');
if (bookingPhotoInput) bookingPhotoInput.addEventListener('change', handleBookingPhotoChange);
const bookingCouponInput = document.getElementById('booking-coupon');
if (bookingCouponInput) {
    bookingCouponInput.addEventListener('input', () => {
        if (bookingCouponInput.value.trim().toUpperCase() !== currentCouponCode) {
            currentCouponCode = null;
            currentDiscount = 0;
            document.getElementById('coupon-message').textContent = '';
            updateBookingSummary();
        }
    });
}

document.getElementById('booking-form').onsubmit = async (e) => {
    e.preventDefault();
    const serviceId = document.getElementById('modal-service-id').value;
    const s = allServices.find(x => x._id === serviceId);
    if (!s) return showToast('Error: Service details not found.', 'error');

    const locality = document.getElementById('booking-locality').value;
    const addressDetails = document.getElementById('booking-address').value.trim();
    const fullAddress = addressDetails.includes(locality) ? addressDetails : `${addressDetails}, ${locality}`;
    const paymentMethod = document.getElementById('booking-payment-method').value;
    const familyProfile = familyProfiles.find(item => item.id === document.getElementById('booking-family-profile').value)?.label || 'For Me';
    const addressLabel = savedAddresses.find(item => item.id === document.getElementById('booking-home-select').value)?.label || 'Custom address';
    const issueNote = document.getElementById('booking-issue').value.trim();
    const providerId = document.getElementById('modal-provider-id').value.trim();
    const baseAfterDiscount = Math.max(0, s.price - (s.price * (currentDiscount / 100)));
    const emergencySurcharge = bookingMode === 'emergency' ? baseAfterDiscount * 0.5 : 0;
    const estimatedTotal = Math.round(baseAfterDiscount + emergencySurcharge);

    const bookingPayload = {
        serviceId,
        providerId,
        address: fullAddress,
        locality,
        date: document.getElementById('booking-date').value,
        timeSlot: document.getElementById('booking-timeslot').value,
        paymentMethod,
        couponCode: currentCouponCode,
        priorityType: bookingMode,
        issueNote,
        issuePhotoName: bookingIssuePhotoName,
        familyProfile,
        addressLabel
    };

    if (paymentMethod === 'cash') {
        const btn = e.target.querySelector('button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.innerHTML = '⏳ Booking...';
        btn.disabled = true;

        try {
            const bookingData = await createBookingRequest(bookingPayload);

            if (bookingData.status === 'success') {
                closeModal('booking-modal');
                showToast('Booking confirmed! You can pay cash after service 🎉', 'success');
                showView('dashboard');
                triggerConfetti();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            } else {
                showToast(bookingData.message || 'Booking failed.', 'error');
            }
        } catch (err) {
            showToast('Booking failed. Please try again.', 'error');
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
        return;
    }

    let orderData;
    try {
        const orderRes = await fetch(`${API_URL}/api/payments/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: estimatedTotal })
        });
        orderData = await orderRes.json();
        if (orderData.status !== 'success') throw new Error(orderData.message);
    } catch (err) {
        return showToast('Failed to initiate payment. ' + err.message, 'error');
    }

    if (orderData.mode === 'simulation') {
        // ===== SIMULATED PAYMENT (Dev Mode) =====
        closeModal('booking-modal');

        // Show simulated payment UI
        const paymentModal = document.createElement('div');
        paymentModal.id = 'sim-payment-modal';
        paymentModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10000;animation:fadeIn 0.3s ease;';
        paymentModal.innerHTML = `
            <div style="background:white;border-radius:20px;padding:2.5rem;max-width:420px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.3);animation:slideUp 0.4s ease;">
                <div style="width:70px;height:70px;background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:50%;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:2rem;">💳</span>
                </div>
                <h3 style="font-size:1.4rem;font-weight:700;color:#1a1a2e;margin-bottom:0.5rem;">Confirm Payment</h3>
                <p style="color:#666;margin-bottom:1.5rem;">${s.name}</p>
                <div style="background:#f8f9ff;border-radius:12px;padding:1.2rem;margin-bottom:1.5rem;">
                    ${(currentDiscount > 0 || bookingMode === 'emergency') ? `<div style="text-decoration:line-through;color:#aaa;font-size:1rem;">₹${s.price.toLocaleString()}</div>` : ''}
                    <div style="font-size:2rem;font-weight:800;color:#4f46e5;">₹${estimatedTotal.toLocaleString()}</div>
                    <div style="font-size:0.8rem;color:#888;margin-top:0.3rem;">Order: ${orderData.data.id.slice(0,20)}...</div>
                    ${bookingMode === 'emergency' ? `<div style="font-size:0.75rem;color:#ef4444;margin-top:0.4rem;">Emergency priority surcharge included</div>` : ''}
                </div>
                <button id="sim-pay-btn" style="width:100%;padding:1rem;background:linear-gradient(135deg,#4f46e5,#3b82f6);color:white;border:none;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:pointer;transition:all 0.3s;margin-bottom:0.8rem;">Pay ₹${estimatedTotal.toLocaleString()} →</button>
                <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:0.7rem;background:transparent;color:#888;border:1px solid #e5e7eb;border-radius:12px;font-size:0.9rem;cursor:pointer;">Cancel</button>
                <div style="margin-top:1rem;font-size:0.75rem;color:#aaa;">🔒 Secure Payment • Development Mode</div>
            </div>
        `;
        document.body.appendChild(paymentModal);

        document.getElementById('sim-pay-btn').onclick = async () => {
            const btn = document.getElementById('sim-pay-btn');
            btn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> Processing...';
            btn.disabled = true;

            try {
                // Create booking
                const bookingData = await createBookingRequest(bookingPayload);

                if (bookingData.status === 'success') {
                    // Verify simulated payment
                    fetch(`${API_URL}/api/payments/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: orderData.data.id,
                            razorpay_payment_id: `pay_sim_${Date.now()}`,
                            bookingId: bookingData.data.booking._id
                        })
                    });

                    paymentModal.remove();
                    showToast('Payment successful! Booking confirmed 🎉', 'success');
                    triggerConfetti();
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    showView('dashboard');
                } else {
                    paymentModal.remove();
                    showToast(bookingData.message || 'Booking failed.', 'error');
                }
            } catch (err) {
                paymentModal.remove();
                showToast('Booking failed. Please try again.', 'error');
            }
        };
    } else {
        // ===== REAL RAZORPAY FLOW (Production) =====
        const options = {
            key: orderData.key_id,
            amount: orderData.data.amount,
            currency: orderData.data.currency,
            name: "Fixentra",
            description: `Booking: ${s.name}`,
            order_id: orderData.data.id,
            handler: async function (response) {
                try {
                    const bookingData = await createBookingRequest(bookingPayload);

                    if (bookingData.status === 'success') {
                        fetch(`${API_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: bookingData.data.booking._id
                            })
                        });

                        showToast('Payment successful! Booking confirmed 🎉', 'success');
                        triggerConfetti();
                        closeModal('booking-modal');
                        showView('dashboard');
                    } else {
                        showToast(bookingData.message || 'Booking failed.', 'error');
                    }
                } catch (err) {
                    showToast('Booking failed. Your payment will be refunded.', 'error');
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone || ""
            },
            theme: { color: "#4f46e5" }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response){
            showToast('Payment Failed. Please try again.', 'error');
        });
        rzp.open();
    }
};

async function updateBooking(id, status) {
    try {
        const response = await fetch(`${API_URL}/api/bookings/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.status === 'success') {
            showToast(`Booking ${status}! ✅`, 'success');
            if (status === 'completed') triggerConfetti();
            renderDashboard();
        }
    } catch (err) {
        showToast('Update failed.', 'error');
    }
}

// ===== GOOGLE AUTH =====
function initGoogleLogin(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // By default, if NO GOOGLE CLIENT ID EXISTS, RENDER THE ULTRA-PREMIUM MOCK BUTTON
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '' || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
        container.innerHTML = `
            <button onclick="handleGoogleResponseMock()" class="btn btn-outline" style="width:100%;display:flex;align-items:center;justify-content:center;gap:0.75rem;font-weight:600;padding:0.75rem;background:white;color:var(--text);border:1px solid #e2e8f0;border-radius:var(--radius-sm);transition:all 0.3s;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" style="width:20px;height:20px;">
                Sign in with Google <span style="font-size:0.65rem;background:var(--primary-light);color:var(--primary);padding:2px 6px;border-radius:4px;margin-left:auto;">TEST MODE</span>
            </button>
        `;
        return;
    }

    // Dynamically load Google script if not already loaded
    if (typeof google === 'undefined' || !google.accounts) {
        if (!document.getElementById('google-gis-script')) {
            const script = document.createElement('script');
            script.id = 'google-gis-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => renderGoogleButton(container);
            document.head.appendChild(script);
        }
        return;
    }
    renderGoogleButton(container);
}

function renderGoogleButton(container) {
    if (typeof google === 'undefined' || !google.accounts) return;
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
    });
    google.accounts.id.renderButton(
        container,
        { theme: "outline", size: "large", width: "100%", text: "continue_with" }
    );
}

// THE BYPASS ENDPOINT FOR LOCAL PATNA DEMO
async function handleGoogleResponseMock() {
    showToast('Simulating secure Google Sign-In...', 'info');
    try {
        const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mock: true })
        });
        const data = await res.json();
        if (data.status === 'success') {
            localStorage.setItem('fixentra_token', data.token);
            localStorage.setItem('fixentra_user', JSON.stringify(data.data.user));
            user = data.data.user; token = data.token;
            showToast(`Welcome via Google, ${user.name}! 🎉`, 'success');
            triggerConfetti();
            initUI();
        } else { showToast(data.message, 'error'); }
    } catch (err) { showToast('Mock Login failed.', 'error'); }
}

async function handleGoogleResponse(response) {
    try {
        const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.credential })
        });
        const data = await res.json();
        if (data.status === 'success') {
            localStorage.setItem('fixentra_token', data.token);
            localStorage.setItem('fixentra_user', JSON.stringify(data.data.user));
            user = data.data.user; token = data.token;
            showToast(`Welcome, ${user.name}! 🎉`, 'success');
            triggerConfetti();
            initUI();
        } else { showToast(data.message, 'error'); }
    } catch (err) { showToast('Google Login failed.', 'error'); }
}

// ===== MODAL CLOSE ON OUTSIDE CLICK =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// ===== #12 PARALLAX =====
window.addEventListener('scroll', () => {
    document.querySelectorAll('.orb').forEach(orb => {
        const speed = 0.3;
        orb.style.transform = `translateY(${window.scrollY * speed}px)`;
    });
});

// ===== #29 PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ===== INIT =====
// initUI() is called from window.onload above
window.addEventListener('hashchange', () => {
    const nextRoute = getRouteFromLocation();
    if (nextRoute !== activeRoute) {
        showView(nextRoute, { skipHashUpdate: true });
    }
});

// ===== #77 LEADERBOARD VIEW =====
function renderLeaderboard() {
    const experts = getFeaturedExpertsData();
    appContainer.innerHTML = `
        <div class="page-transition container" style="position:relative;padding-bottom:6rem;margin-top:2rem;">
            <div class="breadcrumb"><a onclick="showView('home')">${loc[currentLang].navHome}</a> <span>›</span> <span>Leaderboard</span></div>
            <div class="section-head">
                <span class="section-kicker">EXPERT DISCOVERY</span>
                <h2 style="font-size:2.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Top Rated Experts</h2>
                <p style="color:var(--text-muted);margin-top:1rem;">This screen now behaves more like an expert marketplace shortlist with profile depth, ETAs, and direct trust cues.</p>
            </div>
            <div class="experts-grid">
                ${experts.map((expert, index) => `
                    <div class="card expert-card">
                        <div class="expert-portrait">
                            <img src="${normalizeImageSrc(expert.image)}" alt="${expert.name}">
                            <div class="leaderboard-rank rank-${Math.min(index + 1, 3)}" style="position:absolute;top:1rem;left:1rem;">${index < 3 ? ['🥇','🥈','🥉'][index] : index + 1}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;">
                            <div>
                                <h4 style="margin-bottom:0.2rem;">${expert.name}</h4>
                                <p style="font-size:0.8rem;color:var(--text-muted);">${expert.role}</p>
                            </div>
                            <span class="availability-tag">${expert.eta}</span>
                        </div>
                        <div class="service-meta-list" style="margin-bottom:1rem;">
                            <span>⭐ ${expert.rating}</span>
                            <span>${expert.jobs} jobs</span>
                            <span>📍 ${expert.area}</span>
                        </div>
                        <div class="chip-row" style="margin-bottom:1rem;">
                            ${expert.badges.map(badge => `<span class="chip muted-chip">${badge}</span>`).join('')}
                        </div>
                        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.25rem;">${expert.bio}</p>
                        <div class="form-actions">
                            <button class="btn btn-outline" onclick="openExpertProfile('${expert.id}')">View Profile</button>
                            <button class="btn btn-primary" onclick="bookFeaturedExpert('${expert.id}')">Book Expert</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== #70 CORPORATE VIEW =====
function renderCorporate() {
    appContainer.innerHTML = `
        <div class="page-transition container" style="position:relative;padding-bottom:6rem;margin-top:2rem;">
            <div class="breadcrumb"><a onclick="showView('home')">${loc[currentLang].navHome}</a> <span>›</span> <span>Corporate Bookings</span></div>
            <div class="section-head left">
                <span class="section-kicker">SOCIETY AND OFFICE FLOW</span>
                <h2 style="font-size:3rem;margin-bottom:1rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Enterprise Solutions</h2>
                <p style="font-size:1.05rem;line-height:1.7;color:var(--text-muted);">This view now positions Fixentra for offices, apartment societies, and facility managers with package clarity, SLA framing, and bulk-service credibility.</p>
            </div>
            <div class="mini-grid" style="margin-bottom:2rem;">
                <div class="mini-stat-card">
                    <span class="mini-stat-title">Best fit</span>
                    <strong>Apartment societies</strong>
                    <span class="mini-stat-meta">Cleaning, plumbing, electrical, and common-area upkeep</span>
                </div>
                <div class="mini-stat-card">
                    <span class="mini-stat-title">Response promise</span>
                    <strong>2-hour SLA</strong>
                    <span class="mini-stat-meta">Priority routing and account-managed follow-up</span>
                </div>
            </div>
            <div class="responsive-split">
                <div>
                    <div class="plan-grid">
                        <div class="plan-card">
                            <div class="card-category" style="color:var(--primary);">Apartment Society Care</div>
                            <h3 class="card-title">Common-area and resident support</h3>
                            <div class="plan-perks">
                                <span>✓ Shared dashboard for maintenance requests</span>
                                <span>✓ Bulk deep cleaning and electrical audits</span>
                                <span>✓ One invoice cycle for the management team</span>
                            </div>
                        </div>
                        <div class="plan-card">
                            <div class="card-category" style="color:var(--secondary);">Office Ops Plan</div>
                            <h3 class="card-title">Recurring upkeep for teams</h3>
                            <div class="plan-perks">
                                <span>✓ Quarterly preventive maintenance</span>
                                <span>✓ GST-compliant invoicing and visit logs</span>
                                <span>✓ Dedicated WhatsApp escalation line</span>
                            </div>
                        </div>
                    </div>
                    <div class="card" style="margin-top:2rem;">
                        <h3 style="margin-bottom:1rem;">What the dashboard promises</h3>
                        <div class="summary-list">
                            <div class="summary-row"><span>Resident / staff requests</span><strong>Unified queue</strong></div>
                            <div class="summary-row"><span>Recurring plans</span><strong>Monthly or quarterly</strong></div>
                            <div class="summary-row"><span>Commercial trust</span><strong>Invoices, SLA, and account manager</strong></div>
                        </div>
                    </div>
                </div>
                <div class="corporate-form">
                    <h3 style="margin-bottom:1.5rem;">Request Corporate Account</h3>
                    <form onsubmit="submitCorporateLead(event)">
                        <div class="form-group"><label>Company Name</label><input type="text" name="company_name" required placeholder="Acme Corp"></div>
                        <div class="form-group"><label>Contact Email</label><input type="email" name="contact_email" required placeholder="admin@acme.com"></div>
                        <div class="form-group"><label>Use Case</label><select name="use_case" required><option>Apartment Society</option><option>Office / Startup</option><option>Retail / Clinic</option></select></div>
                        <div class="form-group"><label>Expected Monthly Volume</label><select name="monthly_volume" required><option>1-5 jobs</option><option>5-20 jobs</option><option>20+ jobs</option></select></div>
                        <div class="form-group"><label>Priority Need</label><input type="text" name="priority_need" placeholder="Deep cleaning, plumbing, electrical audit"></div>
                        <button class="btn btn-primary btn-lg" style="width:100%;">Submit Request</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}
// ===== #22 REAL-TIME CHAT & SOCKET.IO =====
let socket;
let currentChatBookingId = null;

function initSocket() {
    if (socket) return;
    socket = io(API_URL);

    socket.on('receive_message', (data) => {
        if (currentChatBookingId === data.bookingId) {
            appendMessage(data, 'received');
        } else {
            showToast(`New message from ${data.senderName}`, 'info');
        }
    });
}

async function openChat(bookingId, targetName) {
    initSocket();
    currentChatBookingId = bookingId;
    document.getElementById('chat-target-name').innerText = targetName;
    document.getElementById('chat-messages').innerHTML = '<p style="text-align:center;color:var(--text-light);">Loading chat history...</p>';
    document.getElementById('chat-overlay').style.display = 'flex';

    socket.emit('join_booking', bookingId);

    // Fetch History
    try {
        const res = await fetch(`${API_URL}/api/messages/${bookingId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        document.getElementById('chat-messages').innerHTML = '';
        if (data.status === 'success') {
            data.data.messages.forEach(msg => {
                appendMessage({
                    text: msg.text,
                    senderId: msg.senderId._id,
                    createdAt: msg.createdAt
                }, msg.senderId._id === user._id ? 'sent' : 'received');
            });
        }
    } catch (err) {
        console.error('Chat error:', err);
    }
}

function closeChat() {
    document.getElementById('chat-overlay').style.display = 'none';
    currentChatBookingId = null;
}

async function sendMessageToServer() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentChatBookingId) return;

    const msgData = {
        bookingId: currentChatBookingId,
        text,
        senderId: user._id,
        senderName: user.name,
        createdAt: new Date().toISOString()
    };

    // 1. Send via Socket
    socket.emit('send_message', msgData);

    // 2. Clear Input
    appendMessage(msgData, 'sent');
    input.value = '';

    // 3. Persist to DB
    try {
        await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bookingId: currentChatBookingId, text })
        });
    } catch (err) {
        console.error('Save message err:', err);
    }
}

function appendMessage(data, type) {
    const list = document.getElementById('chat-messages');
    const time = new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgHtml = `
        <div class="message ${type}">
            ${data.text}
            <span class="message-time">${time}</span>
        </div>
    `;
    list.insertAdjacentHTML('beforeend', msgHtml);
    list.scrollTop = list.scrollHeight;
}

// ===== #3 INVOICE DOWNLOAD =====
async function downloadInvoice(bookingId) {
    showToast('Generating your premium invoice...', 'info');
    try {
        const response = await fetch(`${API_URL}/api/invoices/${bookingId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Fixentra_Invoice_${bookingId.substring(0,8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast('Invoice downloaded! 🧾', 'success');
        } else {
            showToast('Invoice generation failed.', 'error');
        }
    } catch (err) {
        showToast('Error downloading invoice.', 'error');
    }
}

// ===== PAYMENT GATEWAY MOCK (Tier 5 Wallet) =====
function triggerRazorpayMock() {
    const amount = prompt("Enter amount to add to Fixentra Wallet (₹):", "500");
    if (!amount || isNaN(amount) || amount <= 0) return showToast('Invalid amount.', 'error');

    // Simulate Razorpay Pop-up Flow
    const rpModal = document.createElement('div');
    rpModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);animation:fadeIn 0.3s;';
    rpModal.innerHTML = `
        <div style="background:white;width:90%;max-width:400px;border-radius:12px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="background:#020617;color:white;padding:1.5rem;text-align:center;">
                <h3 style="margin-bottom:0.5rem;font-weight:700;">Razorpay Test <span style="font-size:0.7rem;background:#ef4444;padding:2px 6px;border-radius:4px;">MOCK</span></h3>
                <p style="opacity:0.8;font-size:0.9rem;">Wallet Recharge: ₹${amount}</p>
            </div>
            <div style="padding:2rem;text-align:center;">
                <p style="margin-bottom:1.5rem;color:var(--text-muted);font-size:0.9rem;">Select a payment method to simulate the transaction.</p>
                <button onclick="processRazorpayMock(${amount}, this)" class="btn btn-primary" style="width:100%;margin-bottom:0.5rem;background:#3b82f6;">💳 Pay with Card</button>
                <button onclick="processRazorpayMock(${amount}, this)" class="btn btn-primary" style="width:100%;background:#10b981;">📱 Pay with UPI / PhonePe</button>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:1rem;background:#f8fafc;border:none;border-top:1px solid #e2e8f0;color:var(--text-muted);cursor:pointer;font-weight:600;">Cancel Transaction</button>
        </div>
    `;
    document.body.appendChild(rpModal);
}

window.processRazorpayMock = function(amount, btnElement) {
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '🔄 Processing...';
    btnElement.style.opacity = '0.7';

    setTimeout(() => {
        // Success Mock (update local state)
        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        localStorage.setItem('fixentra_user', JSON.stringify(user));

        // Update UI
        const balEl = document.getElementById('wallet-balance-display');
        if (balEl) balEl.innerText = '₹' + user.walletBalance;

        btnElement.parentElement.parentElement.parentElement.remove(); // Remove modal
        showToast(`₹${amount} added successfully via Razorpay!`, 'success');
        triggerConfetti();
    }, 1500);
};

// ===== EMERGENCY SOS BOOKING =====
async function triggerSOS() {
    if (!token || !user) {
        showToast('Please login to book an emergency service.', 'warning');
        showView('login');
        return;
    }
    const loaded = await ensureServicesLoaded();
    if (!loaded) return;
    const emergencyService = allServices.find(service => ['electrician', 'plumber', 'appliance repair'].includes(service.category)) || allServices[0];
    if (!emergencyService) {
        showToast('Emergency catalog unavailable right now.', 'error');
        return;
    }
    await openBookingModal(emergencyService._id, emergencyService.name, true);
    showToast('Emergency mode activated. Pros are on high alert.', 'info');
}

// ===== DETECT LOCATION =====
function detectLocation() {
    const btn = document.querySelector('a[onclick="detectLocation()"]');
    if (navigator.geolocation) {
        const oldText = btn.innerText;
        btn.innerText = 'Detecting...';
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if(data.display_name) {
                        document.getElementById('booking-address').value = data.display_name;
                        updateBookingSummary();
                        showToast('Location detected successfully!', 'success');
                    }
                } catch (err) {
                    showToast('Could not resolve location address.', 'warning');
                } finally {
                    btn.innerText = oldText;
                }
            },
            (err) => {
                showToast('Location permission denied.', 'error');
                btn.innerText = oldText;
            }
        );
    } else {
        showToast('Geolocation is not supported by your browser.', 'error');
    }
}

// ===== REVIEW MODAL =====
function openReviewModal(providerId, serviceName) {
    if (!providerId || providerId === 'undefined') {
        return showToast('Provider not assigned yet.', 'warning');
    }
    document.getElementById('review-provider-id').value = providerId;
    document.getElementById('review-service-name').innerText = `How was ${serviceName}?`;
    document.getElementById('review-modal').style.display = 'flex';
}

// Handle Star Clicks
document.getElementById('review-stars').addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
        const val = parseInt(e.target.dataset.val);
        document.getElementById('review-rating').value = val;
        const spans = document.getElementById('review-stars').querySelectorAll('span');
        spans.forEach((span, i) => {
            span.style.opacity = i < val ? '1' : '0.3';
        });
    }
});

document.getElementById('review-form').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        providerId: document.getElementById('review-provider-id').value,
        rating: document.getElementById('review-rating').value,
        comment: document.getElementById('review-text').value
    };

    try {
        const res = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Review submitted! Thank you.', 'success');
            closeModal('review-modal');
            e.target.reset();
            const spans = document.getElementById('review-stars').querySelectorAll('span');
            spans.forEach(span => span.style.opacity = '1');
            document.getElementById('review-rating').value = 5;
            triggerConfetti();
        } else {
            showToast(data.message || 'Error submitting review', 'error');
        }
    } catch(err) {
        showToast('Failed to submit review', 'error');
    }
};

// ===== ADMIN VIEW =====
async function renderAdmin() {
    if (!user || user.role !== 'admin') { showView('home'); return; }

    appContainer.innerHTML = `
        <div class="page-transition container" style="padding-bottom:6rem;">
            <div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Admin Panel</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3rem;">
                <h2 style="font-size:2.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Master Control Center</h2>
                <div style="background:var(--secondary-light);padding:0.5rem 1rem;border-radius:var(--radius-full);color:var(--secondary);font-weight:700;font-size:0.85rem;">System Live 🟢</div>
            </div>

            <div class="admin-stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;" id="admin-stats">
                <div class="card" style="text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Total Revenue</p><h3 style="font-size:2rem;color:var(--primary);">₹0</h3></div>
                <div class="card" style="text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Platform Jobs</p><h3 style="font-size:2rem;color:var(--primary);">0</h3></div>
                <div class="card" style="text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Active Experts</p><h3 style="font-size:2rem;color:var(--primary);">24</h3></div>
                <div class="card" style="text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Active Users</p><h3 style="font-size:2rem;color:var(--primary);">128</h3></div>
            </div>

            <div style="margin-top:4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h3 style="font-size:1.5rem;">Global Booking Pipeline</h3>
                    <button class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.8rem;" onclick="loadAdminBookings()">🔄 Refresh Feed</button>
                </div>
                <div class="grid" id="admin-bookings-grid" style="grid-template-columns:1fr;">
                    <p style="text-align:center;padding:3rem;color:var(--text-muted);">Fetching global pipeline...</p>
                </div>
            </div>
        </div>
    `;
    loadAdminStats();
    loadAdminBookings();
}

async function loadAdminStats() {
    try {
        const res = await fetch(`${API_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.status === 'success') {
            const bookings = data.data.bookings;
            const revenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0);
            const statsGrid = document.getElementById('admin-stats');
            if (statsGrid) {
                statsGrid.children[0].querySelector('h3').innerText = `₹${revenue.toLocaleString()}`;
                statsGrid.children[1].querySelector('h3').innerText = bookings.length;
            }
        }
    } catch(err) { console.error(err); }
}

async function loadAdminBookings() {
    try {
        await loadProviders();
        const res = await fetch(`${API_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const grid = document.getElementById('admin-bookings-grid');
        if (!grid) return;
        if (data.status === 'success') {
            grid.innerHTML = data.data.bookings.map(b => `
                <div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1.5rem;border-left:5px solid ${b.status === 'pending' ? 'var(--warning)' : (b.status === 'completed' ? 'var(--success)' : 'var(--primary)')}">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.4rem;">
                            <span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span>
                            <strong style="font-size:1.1rem;">#${b._id.substring(b._id.length-6)}</strong>
                            <span style="color:var(--text-light);">•</span>
                            <span style="font-weight:600;">${b.serviceId?.name || 'Service'}</span>
                        </div>
                        <p style="font-size:0.85rem;color:var(--text-muted);">
                            <strong>Client:</strong> ${b.userId?.name} (${b.userId?.phone}) <br>
                            <strong>Expert:</strong> ${b.providerId?.name || '<span style="color:var(--danger);">Unassigned</span>'} <br>
                            <strong>Locality:</strong> <span style="color:var(--primary);font-weight:600;">${b.locality || 'Patna'}</span>
                        </p>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:1.25rem;font-weight:800;color:var(--text-dark);margin-bottom:0.5rem;">₹${(b.amount || 0).toLocaleString()}</p>
                        <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
                            <button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.75rem;" onclick="openChat('${b._id}','${b.userId?.name}')">💬 Monitor</button>
                            ${b.status === 'pending' ? `<button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.75rem;" onclick="openAssignExpertModal('${b._id}','${(b.serviceId?.category || '').replace(/'/g, "\\'")}','${(b.locality || 'Patna').replace(/'/g, "\\'")}')">👷 Choose Expert</button><button class="btn btn-primary" style="padding:0.4rem 0.8rem;font-size:0.75rem;" onclick="assignExpertAuto('${b._id}','${(b.serviceId?.category || '').replace(/'/g, "\\'")}','${(b.locality || 'Patna').replace(/'/g, "\\'")}')">⚡ Auto-Assign</button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('') || '<p style="text-align:center;padding:3rem;color:var(--text-muted);">No pipeline activity found.</p>';
        }
    } catch(err) { console.error(err); }
}

async function assignBookingToProvider(bookingId, providerId, providerName) {
    try {
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}/assign`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ providerId })
        });
        const data = await response.json();
        if (data.status === 'success') {
            showToast(`Expert assigned: ${providerName}`, 'success');
            loadAdminBookings();
            return true;
        }
        showToast(data.message || 'Provider assignment failed.', 'error');
        return false;
    } catch (err) {
        showToast('Provider assignment failed.', 'error');
        return false;
    }
}

async function assignExpertAuto(bookingId, category, locality) {
    showToast('Locating best expert for this locality...', 'info');
    const providers = await loadProviders(true);
    if (!providers.length) {
        showToast('No providers available to assign.', 'warning');
        return;
    }
    const bestProvider = [...providers].sort((a, b) => scoreProviderForBooking(b, category, locality) - scoreProviderForBooking(a, category, locality))[0];
    if (!bestProvider) {
        showToast('No suitable provider found.', 'warning');
        return;
    }
    await assignBookingToProvider(bookingId, bestProvider._id, bestProvider.name);
}

async function openAssignExpertModal(bookingId, category, locality) {
    const providers = await loadProviders(true);
    if (!providers.length) {
        showToast('No providers found for assignment.', 'warning');
        return;
    }
    const sortedProviders = [...providers].sort((a, b) => scoreProviderForBooking(b, category, locality) - scoreProviderForBooking(a, category, locality));
    const existing = document.getElementById('assign-expert-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'assign-expert-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:640px;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <div class="summary-shell" style="margin-bottom:1.5rem;">
                <div>
                    <p class="summary-label">Manual assignment</p>
                    <h2 style="margin-bottom:0.25rem;">Choose an expert</h2>
                    <p style="color:var(--text-muted);font-size:0.92rem;">Category: ${category || 'Service'} · Locality: ${locality || 'Patna'}</p>
                </div>
                <div class="summary-price">${sortedProviders.length}</div>
            </div>
            <div class="summary-list">
                ${sortedProviders.map(provider => `
                    <div class="summary-row">
                        <span>${provider.name}<br><small style="color:var(--text-light);">${provider.address || 'Patna'} · ${provider.skills?.join(', ') || 'General expert'}</small></span>
                        <strong>${provider.rating || 4.5}★ · ${provider.completedJobs || 0} jobs <button type="button" class="link-btn" onclick="assignExpertFromModal('${bookingId}','${provider._id}','${provider.name.replace(/'/g, "\\'")}')">Assign</button></strong>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function assignExpertFromModal(bookingId, providerId, providerName) {
    const success = await assignBookingToProvider(bookingId, providerId, providerName);
    if (success) {
        document.getElementById('assign-expert-modal')?.remove();
    }
}

// ===== REFERRAL MODAL =====
function showReferralModal() {
    const code = user.referralCode || 'FIXPATNA';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'referral-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;text-align:center;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <div style="font-size:4rem;margin-bottom:1.5rem;">🎁</div>
            <h2 style="margin-bottom:1rem;">Refer & Earn ₹100</h2>
            <p style="color:var(--text-muted);margin-bottom:2rem;">Share your code with friends in Patna. For every friend who registers and books, you BOTH get ₹100 in your Fixentra wallet!</p>

            <div style="background:var(--primary-light);padding:1.5rem;border-radius:var(--radius-sm);border:2px dashed var(--primary);margin-bottom:2rem;position:relative;">
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">YOUR REFERRAL CODE</p>
                <div style="font-size:2rem;font-weight:900;letter-spacing:4px;color:var(--primary);cursor:pointer;" onclick="copyReferralCode()">${code}</div>
                <button onclick="copyReferralCode()" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--primary);cursor:pointer;">📋</button>
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%;" onclick="shareReferral()">Share on WhatsApp 🚀</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyReferralCode() {
    const code = user.referralCode || 'FIXPATNA';
    navigator.clipboard.writeText(code);
    showToast('Referral code copied to clipboard!', 'success');
}

function shareReferral() {
    const text = `Hey! Use my code ${user.referralCode} to join Fixentra and get ₹100 off on your first home service in Patna! App: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// ===== #4 SCROLL REVEAL OBSERVER =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Also animate counters if they're in view
                entry.target.querySelectorAll('.counter').forEach(el => {
                    if (!el.dataset.animated) {
                        el.dataset.animated = 'true';
                        const target = parseInt(el.getAttribute('data-target'));
                        const suffix = el.getAttribute('data-suffix') || '';
                        let current = 0;
                        const step = target / 60;
                        const timer = setInterval(() => {
                            current += step;
                            if (current >= target) { current = target; clearInterval(timer); }
                            el.textContent = Math.floor(current).toLocaleString() + suffix;
                        }, 20);
                    }
                });
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => observer.observe(el));
}

// ===== #5 SOCIAL PROOF TOASTS =====
let socialProofTimer = null;
const socialProofData = [
    { name: 'Rahul', service: 'Deep Cleaning', area: 'Kankarbagh', time: '2 minutes ago' },
    { name: 'Priya', service: 'AC Repair', area: 'Boring Road', time: '5 minutes ago' },
    { name: 'Aman', service: 'Plumber Fix', area: 'Rajendra Nagar', time: '8 minutes ago' },
    { name: 'Sneha', service: 'Electrician', area: 'Patliputra Colony', time: '12 minutes ago' },
    { name: 'Vikram', service: 'Pest Control', area: 'Bailey Road', time: '15 minutes ago' },
    { name: 'Neha', service: 'Wall Painting', area: 'Danapur', time: '18 minutes ago' },
    { name: 'Arjun', service: 'Kitchen Cleaning', area: 'Kankarbagh', time: '3 minutes ago' },
    { name: 'Ritu', service: 'Carpenter Work', area: 'Boring Road', time: '7 minutes ago' }
];

function initSocialProof() {
    if (socialProofTimer) clearInterval(socialProofTimer);
    let index = 0;
    function showProof() {
        const toast = document.getElementById('social-proof-toast');
        if (!toast) return;
        const data = socialProofData[index % socialProofData.length];
        const textEl = document.getElementById('sp-text');
        const timeEl = document.getElementById('sp-time');
        if (textEl) textEl.innerHTML = `<strong>${data.name}</strong> just booked ${data.service} in <strong>${data.area}</strong>`;
        if (timeEl) timeEl.textContent = data.time;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4000);
        index++;
    }
    setTimeout(showProof, 5000);
    socialProofTimer = setInterval(showProof, 15000);
}

// ===== #27 LIVE BOOKING COUNTER =====
function initLiveCounter() {
    const el = document.getElementById('live-booking-count');
    if (!el) return;
    let count = 47;
    setInterval(() => {
        count += Math.floor(Math.random() * 3) + 1;
        el.textContent = count;
    }, 8000);
}

// ===== #12 TESTIMONIAL CAROUSEL =====
let testimonialSlide = 0;
let testimonialAutoTimer = null;

function getTestimonialSlidesCount() {
    return window.innerWidth <= 768 ? 1 : 3;
}

function moveTestimonials(dir) {
    const track = document.getElementById('testimonial-track');
    if (!track) return;
    const cards = track.querySelectorAll('.uc-testimonial-card');
    const visibleCount = getTestimonialSlidesCount();
    const maxSlide = Math.max(0, cards.length - visibleCount);
    testimonialSlide = Math.max(0, Math.min(testimonialSlide + dir, maxSlide));
    const cardWidth = 100 / visibleCount;
    track.style.transform = `translateX(-${testimonialSlide * cardWidth}%)`;
    updateTestimonialDots();
}

function goToTestimonial(index) {
    testimonialSlide = index;
    moveTestimonials(0);
}

function updateTestimonialDots() {
    document.querySelectorAll('.t-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === testimonialSlide);
    });
}

function initTestimonialAutoplay() {
    if (testimonialAutoTimer) clearInterval(testimonialAutoTimer);
    testimonialSlide = 0;
    testimonialAutoTimer = setInterval(() => {
        const track = document.getElementById('testimonial-track');
        if (!track) { clearInterval(testimonialAutoTimer); return; }
        const cards = track.querySelectorAll('.uc-testimonial-card');
        const visibleCount = getTestimonialSlidesCount();
        const maxSlide = Math.max(0, cards.length - visibleCount);
        testimonialSlide = testimonialSlide >= maxSlide ? 0 : testimonialSlide + 1;
        const cardWidth = 100 / visibleCount;
        track.style.transform = `translateX(-${testimonialSlide * cardWidth}%)`;
        updateTestimonialDots();
    }, 4000);
}

// ===== #25 BUTTON RIPPLE EFFECT =====
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// ===== #14 STICKY MOBILE CTA =====
(function initStickyCTA() {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const cta = document.getElementById('sticky-mobile-cta');
        if (!cta || window.innerWidth > 768) return;
        const scrollY = window.scrollY;
        if (scrollY > 600 && scrollY > lastScroll) {
            cta.classList.add('visible');
        } else if (scrollY < 300) {
            cta.classList.remove('visible');
        }
        lastScroll = scrollY;
    }, { passive: true });
})();

// ===== #26 PWA INSTALL PROMPT =====
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    setTimeout(() => {
        const banner = document.getElementById('pwa-install-banner');
        if (banner && !localStorage.getItem('fixentra_pwa_dismissed')) {
            banner.classList.add('visible');
        }
    }, 10000);
});

function installPWA() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                showToast('Fixentra installed! Find it on your home screen.', 'success');
            }
            deferredInstallPrompt = null;
            dismissPWABanner();
        });
    }
}

function dismissPWABanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.remove('visible');
    localStorage.setItem('fixentra_pwa_dismissed', 'true');
}

// ===== #23 PARALLAX SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const dots = document.querySelectorAll('.parallax-dot');
    if (!dots.length) return;
    const scrollY = window.scrollY;
    dots.forEach((dot, i) => {
        const speed = 0.02 + (i * 0.01);
        dot.style.transform = `translateY(${scrollY * speed * (i % 2 === 0 ? -1 : 1)}px)`;
    });
}, { passive: true });


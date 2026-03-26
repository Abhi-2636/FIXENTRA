// ===== FIXENTRA ULTRA PREMIUM APP =====
// State
let user = JSON.parse(localStorage.getItem('fixentra_user')) || null;
let token = localStorage.getItem('fixentra_token') || null;
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : window.location.origin;

const GOOGLE_CLIENT_ID = ''; // Paste your real Google Client ID here (from console.cloud.google.com)
let allServices = [];
let currentCarouselSlide = 0;

const appContainer = document.getElementById('app-container');
const authBtns = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');

// ===== #14 LOADING SCREEN =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1600);
    // #20 Onboarding
    if (!localStorage.getItem('fixentra_onboarded')) {
        setTimeout(() => showOnboarding(), 2200);
    }
    initUI();
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

// ===== #4 TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-msg">${message}</span>
        <span class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(()=>this.parentElement.remove(),300)">✕</span>
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

// ===== #18 BACK TO TOP =====
window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top');
    if (btn) {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }
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
    { icon: '🏠', title: 'Welcome to Fixentra!', desc: 'India\'s most trusted platform for home services. Book verified experts in just 3 clicks.' },
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
    en: { heroTitle: 'Expert Home Services, One Tap Away.', navHome: 'Home', navServices: 'Services', navExpert: 'Top Experts', navCorp: 'Corporate' },
    hi: { heroTitle: 'विशेषज्ञ गृह सेवाएँ, बस एक टैप दूर।', navHome: 'होम', navServices: 'सेवाएं', navExpert: 'शीर्ष विशेषज्ञ', navCorp: 'कॉर्पोरेट' }
};
let currentLang = 'en';

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase().includes(lang === 'en' ? 'en' : 'hi')));
    showToast(lang === 'en' ? 'Language switched to English' : 'भाषा हिंदी में बदल दी गई', 'info');
    showView('home');
}

// ===== INIT UI =====
function initUI() {
    if (token && user) {
        authBtns.style.display = 'none';
        userMenu.style.display = 'flex';
        const ml = document.getElementById('mobile-login');
        const md = document.getElementById('mobile-dashboard');
        if (ml) ml.style.display = 'none';
        if (md) md.style.display = 'block';
        showView('dashboard');
    } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
        showView('home');
    }
}

// ===== #9 PAGE TRANSITIONS =====
function showView(view) {
    appContainer.style.opacity = '0';
    appContainer.style.transform = 'translateY(10px)';
    setTimeout(() => {
        appContainer.innerHTML = '';
        window.scrollTo(0, 0);
        switch(view) {
            case 'home': renderHome(); break;
            case 'login': renderLogin(); break;
            case 'register': renderRegister(); break;
            case 'services': renderServices(); break;
            case 'dashboard': renderDashboard(); break;
            case 'leaderboard': renderLeaderboard(); break;
            case 'corporate': renderCorporate(); break;
            default: renderHome();
        }
        requestAnimationFrame(() => {
            appContainer.style.transition = 'opacity 0.4s, transform 0.4s';
            appContainer.style.opacity = '1';
            appContainer.style.transform = 'translateY(0)';
        });
        // Update bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('active'));
    }, 150);
}

// ===== HOME VIEW =====
function renderHome() {
    appContainer.innerHTML = `
        <div class="page-transition" style="position:relative;overflow:hidden;">
            <div class="orb orb-1" style="top:-100px;left:-100px;"></div>
            <div class="orb orb-2" style="bottom:-100px;right:-100px;"></div>
            <!-- #63 Install Banner -->
            <div class="install-banner" id="install-banner">
                <span style="font-size:1.5rem;">🎉</span>
                <div style="flex:1;"><strong>Get the Fixentra App</strong><p style="font-size:0.8rem;opacity:0.9;">Faster bookings and exclusive offers.</p></div>
                <button onclick="this.parentElement.style.display='none';showToast('App installed','success')">Install</button>
            </div>

            <!-- Hero -->
            <section class="container hero">
                <div class="hero-content">
                    <span class="hero-tag">🏆 India's #1 Rated Home Services Platform</span>
                    <h1>${loc[currentLang].heroTitle || 'Expert Home Services, One Tap Away.'}</h1>
                    <p>Book verified electricians, plumbers, cleaners & carpenters at transparent prices. 30-day work guarantee included.</p>
                    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                        <button class="btn btn-primary btn-lg" onclick="showView('services')">📋 Book a Service</button>
                        <button class="btn btn-outline" onclick="showView('register')">Join as Expert →</button>
                    </div>
                    <!-- #19 Search & #65 Voice Search -->
                    <div class="search-container" style="position:relative;">
                        <span class="search-icon">🔍</span>
                        <input class="search-input" id="hero-search" type="text" placeholder="What do you need fixed?" oninput="handleSearch(this.value)" style="padding-right:3rem;">
                        <button class="voice-btn" id="voice-btn" onclick="toggleVoiceSearch()" title="Search with voice" style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1.3rem;">🎤</button>
                        <div class="search-results" id="search-results"></div>
                    </div>
                    <!-- #2 Animated Counters -->
                    <div style="display:flex;gap:3rem;margin-top:2.5rem;">
                        <div><h3 style="font-size:1.5rem;color:var(--primary);"><span class="counter" data-target="10000" data-suffix="+">0</span></h3><p style="font-size:0.8rem;color:var(--text-muted);">Happy Users</p></div>
                        <div><h3 style="font-size:1.5rem;color:var(--primary);"><span class="counter" data-target="500" data-suffix="+">0</span></h3><p style="font-size:0.8rem;color:var(--text-muted);">Verified Experts</p></div>
                        <div><h3 style="font-size:1.5rem;color:var(--accent);">4.8★</h3><p style="font-size:0.8rem;color:var(--text-muted);">Avg Rating</p></div>
                    </div>
                </div>
                <div class="hero-img floating">
                    <img src="hero.png" alt="Fixentra Expert">
                    <div class="hero-badge">
                        <div class="pulse-dot"></div>
                        <p style="font-weight:700;font-size:0.9rem;">200+ Experts Online</p>
                    </div>
                </div>
            </section>

            <!-- Categories -->
            <section style="background:var(--card-bg);padding:6rem 0;">
                <div class="container">
                    <div style="text-align:center;margin-bottom:4rem;">
                        <h2 style="font-size:2.5rem;margin-bottom:1rem;">Our Trending Services</h2>
                        <p style="color:var(--text-muted);max-width:600px;margin:0 auto;">Choose from our wide range of professional services, all at standardized prices.</p>
                    </div>
                    <div class="grid">
                        ${[
                            {cat:'Cleaning',title:'Home Deep Cleaning',price:'₹3,499',desc:'Full sanitization, dusting, and floor polishing.',booked:32},
                            {cat:'Electrician',title:'Fan/Appliance Install',price:'₹499',desc:'Expert installation with 30-day warranty.',booked:18},
                            {cat:'Carpenter',title:'Furniture Repair',price:'₹899',desc:'Fixing hinges, handles, and squeaky doors.',booked:24},
                            {cat:'Plumber',title:'Water Tap/Valve Fix',price:'₹599',desc:'Fixing leakages and blockages efficiently.',booked:15}
                        ].map(s => `
                            <div class="card" onclick="showView('services')" style="cursor:pointer;">
                                <div class="card-category">${s.cat}</div>
                                <h3 class="card-title">${s.title}</h3>
                                <p class="card-price">${s.price}</p>
                                <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem;">${s.desc}</p>
                                <div class="recently-booked">${s.booked} booked today</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- How it Works -->
            <section class="container" style="padding:8rem 0;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
                    <div>
                        <h2 style="font-size:3rem;margin-bottom:2rem;">How it Works?</h2>
                        ${[
                            {n:'1',t:'Search & Book',d:'Choose a service and pick a date and time that fits your schedule.'},
                            {n:'2',t:'Get Matched',d:'Our system assigns a background-verified expert to your booking instantly.'},
                            {n:'3',t:'Sit Back & Relax',d:'Expert arrives on time, completes the task, and you pay after satisfaction.'}
                        ].map(s => `
                            <div style="display:flex;gap:1.5rem;margin-bottom:2rem;">
                                <div style="flex-shrink:0;background:var(--gradient-primary);color:white;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;box-shadow:var(--shadow-glow);">${s.n}</div>
                                <div><h3 style="margin-bottom:0.4rem;">${s.t}</h3><p style="color:var(--text-muted);">${s.d}</p></div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="background:var(--gradient-primary);padding:3.5rem;border-radius:2rem;color:white;">
                        <h2 style="color:white;margin-bottom:1.5rem;">The Fixentra Promise 🛡️</h2>
                        <ul style="list-style:none;display:flex;flex-direction:column;gap:1.5rem;">
                            <li style="display:flex;gap:1rem;align-items:center;">✅ <span>Best-in-class pricing, no surprises.</span></li>
                            <li style="display:flex;gap:1rem;align-items:center;">✅ <span>3-step vetted & skilled professionals.</span></li>
                            <li style="display:flex;gap:1rem;align-items:center;">✅ <span>30-day re-work guarantee on all jobs.</span></li>
                            <li style="display:flex;gap:1rem;align-items:center;">✅ <span>Insurance-backed for every service.</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- #33 Price Comparison -->
            <section style="background:var(--card-bg);padding:6rem 0;">
                <div class="container">
                    <div style="text-align:center;margin-bottom:3rem;">
                        <h2 style="font-size:2.5rem;margin-bottom:1rem;">Why Fixentra? Compare & Save 💰</h2>
                        <p style="color:var(--text-muted);">See how our pricing stacks up vs local market rates.</p>
                    </div>
                    <table class="compare-table">
                        <thead><tr><th>Service</th><th>Local Market</th><th>Fixentra Price</th><th>You Save</th></tr></thead>
                        <tbody>
                            <tr><td>Home Deep Cleaning</td><td>₹5,000 - ₹7,000</td><td class="highlight">₹3,499</td><td style="color:var(--secondary);font-weight:700;">Up to 50%</td></tr>
                            <tr><td>Electrician Visit</td><td>₹800 - ₹1,200</td><td class="highlight">₹499</td><td style="color:var(--secondary);font-weight:700;">Up to 58%</td></tr>
                            <tr><td>Plumber Repair</td><td>₹800 - ₹1,500</td><td class="highlight">₹599</td><td style="color:var(--secondary);font-weight:700;">Up to 60%</td></tr>
                            <tr><td>Carpenter Work</td><td>₹1,200 - ₹2,000</td><td class="highlight">₹899</td><td style="color:var(--secondary);font-weight:700;">Up to 55%</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Safety & Mission -->
            <section style="padding:6rem 0;">
                <div class="container">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
                        <div style="padding:2.5rem;background:var(--card-bg);backdrop-filter:blur(10px);border:var(--glass-border);border-radius:2rem;box-shadow:var(--shadow);">
                            <h2 style="margin-bottom:1.5rem;">Safety First 🛡️</h2>
                            <p style="color:var(--text-muted);margin-bottom:2rem;">We prioritize the safety of your home above all else.</p>
                            <ul style="list-style:none;display:flex;flex-direction:column;gap:1.5rem;">
                                ${[
                                    {i:'🔍',t:'Strict Vetting',d:'Every expert undergoes a 3-step background check.'},
                                    {i:'💳',t:'Secure Payments',d:'Payments released only after job completion.'},
                                    {i:'📱',t:'24/7 SOS Support',d:'Dedicated emergency support during service.'}
                                ].map(x => `
                                    <li style="display:flex;gap:1rem;align-items:flex-start;">
                                        <div style="background:var(--primary-light);padding:0.6rem;border-radius:10px;font-size:1.2rem;">${x.i}</div>
                                        <div><h4 style="margin-bottom:0.2rem;">${x.t}</h4><p style="font-size:0.85rem;color:var(--text-muted);">${x.d}</p></div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h2 style="font-size:2.5rem;margin-bottom:2rem;">Our Mission</h2>
                            <p style="color:var(--text-muted);line-height:1.8;font-size:1.1rem;margin-bottom:2rem;">
                                Fixentra bridges the gap between skilled Indian craftsmen and urban households. Every home deserves professional care.
                            </p>
                            <p style="color:var(--text-muted);line-height:1.8;">
                                Serving <b>Delhi NCR, Mumbai, Bengaluru, Pune, and Hyderabad</b>. Goal: every doorstep by 2030.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FAQ -->
            <section class="container" style="padding:6rem 0;">
                <div style="text-align:center;margin-bottom:4rem;">
                    <h2 style="font-size:2.5rem;margin-bottom:1rem;">Got Questions? 🤔</h2>
                    <p style="color:var(--text-muted);">Everything you need to know about our services.</p>
                </div>
                <div style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;">
                    ${[
                        {q:'Are the experts background verified?',a:'Yes. Every provider undergoes a rigorous 3-step ID check, skill assessment, and personal interview.'},
                        {q:'What if I\'m not happy with the service?',a:'We offer a 30-day Fixentra Guarantee. We\'ll send another expert free of charge.'},
                        {q:'How far in advance should I book?',a:'We recommend 24 hours, but we also offer Express Service (2-4 hours) for emergencies.'},
                        {q:'Do I need to provide tools?',a:'No! Our experts come fully equipped with professional-grade tools and supplies.'}
                    ].map(f => `
                        <div class="card" style="cursor:pointer;padding:1.5rem 2rem;" onclick="this.querySelector('.faq-answer').style.display = this.querySelector('.faq-answer').style.display === 'block' ? 'none' : 'block'">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <h4>${f.q}</h4><span style="color:var(--primary);font-size:1.3rem;">+</span>
                            </div>
                            <p class="faq-answer" style="display:none;color:var(--text-muted);font-size:0.95rem;margin-top:1rem;line-height:1.7;">${f.a}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- #27 Testimonial Carousel -->
            <section style="background:#0f172a;color:white;padding:6rem 0;">
                <div class="container">
                    <h2 style="color:white;text-align:center;margin-bottom:3rem;">What Our Customers Say ❤️</h2>
                    <div class="carousel-container">
                        <div class="carousel-track" id="carousel-track">
                            ${[
                                [{q:'Excellent cleaning service in Delhi! Very professional.',n:'Rahul Sharma',c:'Delhi',r:'⭐⭐⭐⭐⭐'},{q:'Fixed my AC within 2 hours. Polite technician.',n:'Priya Patel',c:'Mumbai',r:'⭐⭐⭐⭐⭐'},{q:'Great carpentry work. Reasonable pricing.',n:'Amit Verma',c:'Pune',r:'⭐⭐⭐⭐'}],
                                [{q:'Plumber was on time and very skilled. Saved my kitchen!',n:'Sneha Gupta',c:'Bengaluru',r:'⭐⭐⭐⭐⭐'},{q:'Deep cleaning transformed my 2BHK. Incredible!',n:'Vikram Singh',c:'Hyderabad',r:'⭐⭐⭐⭐⭐'},{q:'Electrical wiring done neatly. Will book again.',n:'Meera Joshi',c:'Delhi NCR',r:'⭐⭐⭐⭐'}]
                            ].map(slide => `
                                <div class="carousel-slide">
                                    <div class="grid" style="grid-template-columns:repeat(3,1fr);">
                                        ${slide.map(t => `
                                            <div style="background:rgba(255,255,255,0.05);padding:2rem;border-radius:var(--radius);border:1px solid rgba(255,255,255,0.08);">
                                                <p style="margin-bottom:0.5rem;">${t.r}</p>
                                                <p style="font-style:italic;margin-bottom:1.5rem;opacity:0.85;">"${t.q}"</p>
                                                <p style="font-weight:700;">— ${t.n}</p>
                                                <p style="font-size:0.75rem;opacity:0.5;">${t.c}</p>
                                                <div class="verified-badge" style="margin-top:0.5rem;color:#10b981;"><span style="background:#10b981;color:white;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;margin-right:4px;">✓</span> Verified Customer</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="carousel-nav carousel-prev" onclick="moveCarousel(-1)">←</button>
                        <button class="carousel-nav carousel-next" onclick="moveCarousel(1)">→</button>
                        <div class="carousel-dots">
                            <button class="carousel-dot active" onclick="goToSlide(0)"></button>
                            <button class="carousel-dot" onclick="goToSlide(1)"></button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer style="background:var(--card-bg);backdrop-filter:blur(30px);border-top:var(--glass-border);padding:6rem 0 3rem;position:relative;overflow:hidden;margin-top:auto;">
                <div class="orb shadow" style="width:500px;height:500px;background:var(--primary);top:-200px;left:-200px;opacity:0.2;"></div>
                <div class="orb shadow" style="width:400px;height:400px;background:var(--secondary);bottom:-100px;right:-100px;opacity:0.15;"></div>
                
                <div class="container" style="position:relative;z-index:2;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:4rem;margin-bottom:4rem;">
                        
                        <!-- Brand Column -->
                        <div style="display:flex;flex-direction:column;gap:1.5rem;">
                            <div class="logo" style="font-size:2rem;">Fixentra.</div>
                            <p style="color:var(--text-muted);font-size:0.95rem;line-height:1.8;">India's fastest-growing premium home services platform. Delivering expert care for your home with a 30-day satisfaction guarantee.</p>
                            <div style="display:flex;gap:1rem;margin-top:1rem;">
                                <a href="#" style="width:45px;height:45px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(120,120,120,0.2);display:flex;align-items:center;justify-content:center;transition:0.3s;font-size:1.2rem;color:var(--primary);" onmouseover="this.style.transform='translateY(-5px)';this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.transform='translateY(0)';this.style.background='rgba(255,255,255,0.05)';this.style.color='var(--primary)'">𝕏</a>
                                <a href="#" style="width:45px;height:45px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(120,120,120,0.2);display:flex;align-items:center;justify-content:center;transition:0.3s;font-size:1.2rem;color:var(--primary);" onmouseover="this.style.transform='translateY(-5px)';this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.transform='translateY(0)';this.style.background='rgba(255,255,255,0.05)';this.style.color='var(--primary)'">📸</a>
                                <a href="#" style="width:45px;height:45px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(120,120,120,0.2);display:flex;align-items:center;justify-content:center;transition:0.3s;font-size:1.2rem;color:var(--primary);" onmouseover="this.style.transform='translateY(-5px)';this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.transform='translateY(0)';this.style.background='rgba(255,255,255,0.05)';this.style.color='var(--primary)'">💼</a>
                            </div>
                        </div>

                        <!-- Links Column 1 -->
                        <div style="display:flex;flex-direction:column;gap:1.2rem;">
                            <h4 style="font-size:1.2rem;color:var(--text);margin-bottom:0.5rem;font-weight:800;">Company</h4>
                            <a href="#" style="color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">About Us</a>
                            <a href="#" style="color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Careers 🚀</a>
                            <a href="#" style="color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Terms & Conditions</a>
                            <a href="#" style="color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Privacy Policy</a>
                        </div>

                        <!-- Links Column 2 -->
                        <div style="display:flex;flex-direction:column;gap:1.2rem;">
                            <h4 style="font-size:1.2rem;color:var(--text);margin-bottom:0.5rem;font-weight:800;">Services</h4>
                            <a onclick="showView('services')" style="cursor:pointer;color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Deep Cleaning</a>
                            <a onclick="showView('services')" style="cursor:pointer;color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Electrical & Plumbing</a>
                            <a onclick="showView('services')" style="cursor:pointer;color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">AC Maintenance</a>
                            <a onclick="showView('corporate')" style="cursor:pointer;color:var(--text-muted);transition:0.3s;" onmouseover="this.style.color='var(--primary)';this.style.paddingLeft='10px'" onmouseout="this.style.color='var(--text-muted)';this.style.paddingLeft='0'">Corporate Bookings</a>
                        </div>

                        <!-- Newsletter Column -->
                        <div style="display:flex;flex-direction:column;gap:1.2rem;">
                            <h4 style="font-size:1.2rem;color:var(--text);margin-bottom:0.5rem;font-weight:800;">Get Exclusive Deals</h4>
                            <p style="color:var(--text-muted);font-size:0.9rem;">Subscribe to our newsletter for 15% off your first premium booking.</p>
                            <div style="display:flex;background:var(--bg);border-radius:var(--radius-full);padding:0.4rem;box-shadow:inset 0 2px 5px rgba(0,0,0,0.05);margin-top:0.5rem;">
                                <input type="email" placeholder="Email address..." style="border:none;background:transparent;padding:0.5rem 1rem;flex:1;outline:none;color:var(--text);">
                                <button class="btn btn-primary" style="padding:0.6rem 1.2rem;border-radius:var(--radius-full);" onclick="showToast('Subscribed to Newsletter! 🎉', 'success')">Join</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top:1px solid rgba(150,150,150,0.2);padding-top:2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1.5rem;">
                        <p style="color:var(--text-muted);font-size:0.9rem;font-weight:500;">&copy; ${new Date().getFullYear()} Fixentra Technologies Pvt Ltd. Designed with ♥ in India.</p>
                        <div style="display:flex;gap:1rem;align-items:center;">
                            <span style="font-size:0.85rem;font-weight:700;color:var(--text-muted);background:var(--bg);padding:0.4rem 1rem;border-radius:99px;">🔒 256-Bit Secure</span>
                            <span style="font-size:0.85rem;font-weight:700;color:var(--text-muted);background:var(--bg);padding:0.4rem 1rem;border-radius:99px;">⭐ 4.8 App Store</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;
    // Trigger counter animations
    setTimeout(animateCounters, 500);
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

// ===== #19 SEARCH =====
function handleSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!query.trim()) { resultsDiv.classList.remove('active'); return; }
    const services = ['Home Deep Cleaning','Electrician','Plumber','Carpenter','AC Repair','Kitchen Cleaning','Furniture Assembly'];
    const filtered = services.filter(s => s.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length) {
        resultsDiv.innerHTML = filtered.map(s => `<div class="search-item" onclick="showView('services');document.getElementById('search-results').classList.remove('active');">${s}</div>`).join('');
        resultsDiv.classList.add('active');
    } else {
        resultsDiv.innerHTML = '<div class="search-item" style="color:var(--text-light);">No services found</div>';
        resultsDiv.classList.add('active');
    }
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

// ===== REGISTER VIEW =====
function renderRegister() {
    appContainer.innerHTML = `
        <div class="page-transition" style="position:relative;overflow:hidden;min-height:85vh;display:flex;align-items:center;justify-content:center;">
            <div class="orb orb-1" style="top:-10%;right:-10%;left:auto;background:rgba(16,185,129,0.3);"></div>
            <div class="orb orb-2" style="bottom:-10%;left:-10%;right:auto;background:rgba(245,158,11,0.25);"></div>
            <div style="position:absolute;top:0;left:0;right:0;"><div class="container"><div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Register</span></div></div></div>
            <div class="auth-container" style="max-width:600px;position:relative;z-index:10;width:100%;">
                <h2 style="margin-bottom:2rem;text-align:center;background:linear-gradient(135deg,#0f172a 0%,#10b981 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Create Your Account</h2>
                <form onsubmit="handleAuth(event,'register')">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                        <div class="form-group"><label>Full Name</label><input type="text" id="reg-name" required placeholder="Vikram Kumar"></div>
                        <div class="form-group"><label>Email Address</label><input type="email" id="reg-email" required placeholder="vikram@example.in"></div>
                    </div>
                    <div class="form-group"><label>Role</label><select id="reg-role" required><option value="user">User (I want services)</option><option value="provider">Provider (I offer services)</option></select></div>
                    <div class="form-group"><label>Address</label><input type="text" id="reg-address" required placeholder="Flat, Building, Street, City"></div>
                    <div class="form-group"><label>Phone Number</label><input type="text" id="reg-phone" required placeholder="+91 98765 43210"></div>
                    <div class="form-group"><label>Password</label><input type="password" id="reg-password" required minlength="6" placeholder="••••••••"></div>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Create Account ✨</button>
                    <div style="margin:2rem 0;display:flex;align-items:center;gap:1rem;">
                        <hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;"><span style="color:var(--text-light);font-size:0.8rem;">OR</span><hr style="flex:1;border:0.5px solid var(--text-light);opacity:0.3;">
                    </div>
                    <div id="google-reg-btn" style="display:flex;justify-content:center;"></div>
                    <p style="text-align:center;margin-top:1.5rem;color:var(--text-muted);">Already have an account? <a onclick="showView('login')" style="color:var(--primary);cursor:pointer;font-weight:600;">Login</a></p>
                </form>
            </div>
        </div>
    `;
    setTimeout(() => initGoogleLogin('google-reg-btn'), 200);
}

// ===== #3 SERVICE FILTERS + #7 SKELETON + #8 DETAIL MODAL + #32 RECENTLY BOOKED + #35 VERIFIED =====
async function renderServices() {
    appContainer.innerHTML = `
        <div class="page-transition container" style="position:relative;padding-bottom:6rem;">
            <div class="orb orb-1" style="background:rgba(37,99,235,0.15);width:600px;height:600px;left:-200px;top:-100px;"></div>
            <div style="position:relative;z-index:10;">
                <div class="breadcrumb"><a onclick="showView('home')">Home</a> <span>›</span> <span>Services</span></div>
                <div style="text-align:center;margin-bottom:3rem;margin-top:1rem;">
                    <h2 style="font-size:3rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Available Experts</h2>
                    <p style="color:var(--text-muted);font-size:1.1rem;margin-top:1rem;">Book top-rated professionals at upfront prices.</p>
                </div>
                <!-- #3 Filter Pills -->
                <div class="filter-pills" id="filter-pills">
                    <button class="filter-pill active" onclick="filterServices('all')">All</button>
                    <button class="filter-pill" onclick="filterServices('cleaning')">🧹 Cleaning</button>
                    <button class="filter-pill" onclick="filterServices('electrician')">⚡ Electrician</button>
                    <button class="filter-pill" onclick="filterServices('plumber')">🔧 Plumber</button>
                    <button class="filter-pill" onclick="filterServices('carpenter')">🪚 Carpenter</button>
                    <button class="filter-pill" onclick="filterServices('appliance repair')">🔩 Appliance</button>
                </div>
                <!-- #7 Skeleton Loading -->
                <div class="grid" id="services-grid">
                    ${Array(4).fill(0).map(() => `<div class="card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%;"></div><div class="skeleton skeleton-text" style="width:90%;margin-top:1rem;height:60px;"></div><div class="skeleton skeleton-text" style="width:50%;margin-top:1rem;"></div></div>`).join('')}
                </div>
            </div>
        </div>`;

    try {
        const response = await fetch(`${API_URL}/api/services`);
        const data = await response.json();
        allServices = data.data.services;
        renderServiceCards(allServices);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('services-grid').innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Could not load services. Make sure the backend is running at ${API_URL}.</p>`;
    }
}

function renderServiceCards(services) {
    const grid = document.getElementById('services-grid');
    if (!services.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No services match this filter.</p>'; return; }
    const booked = [32, 18, 24, 15, 9, 21, 12];
    grid.innerHTML = services.map((s, i) => `
        <div class="card" style="animation:fadeIn ${0.3 + i * 0.1}s ease-out;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div class="card-category">${s.category}</div>
                <div class="verified-badge"><span style="background:var(--secondary);color:white;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;margin-right:4px;">✓</span>Verified</div>
            </div>
            <h3 class="card-title" style="margin-top:0.75rem;">${s.name}</h3>
            <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.25rem;">${s.description || 'Professional service.'}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <p class="card-price">₹${s.price.toLocaleString()}</p>
                <button class="btn btn-primary" onclick="event.stopPropagation();openBookingModal('${s._id}','${s.name.replace(/'/g, "\\'")}')">Book Now</button>
            </div>
            <div class="recently-booked">${booked[i % booked.length]} booked today</div>
            <p style="font-size:0.75rem;color:var(--primary);cursor:pointer;margin-top:0.75rem;font-weight:600;" onclick="event.stopPropagation();showServiceDetail('${s._id}')">View Details →</p>
        </div>
    `).join('');
}

function filterServices(category) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    const filtered = category === 'all' ? allServices : allServices.filter(s => s.category === category);
    renderServiceCards(filtered);
}

// ===== #8 SERVICE DETAIL MODAL =====
function showServiceDetail(id) {
    const s = allServices.find(x => x._id === id);
    if (!s) return;
    const content = document.getElementById('service-detail-content');
    content.innerHTML = `
        <div style="text-align:center;margin-bottom:2rem;">
            <div class="card-category" style="font-size:0.85rem;">${s.category}</div>
            <h2 style="margin-top:0.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">${s.name}</h2>
        </div>
        <p style="color:var(--text-muted);line-height:1.8;margin-bottom:2rem;">${s.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem;">
            <div style="background:var(--primary-light);padding:1rem;border-radius:var(--radius-sm);text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Price</p><p style="font-size:1.5rem;font-weight:800;color:var(--primary);">₹${s.price.toLocaleString()}</p></div>
            <div style="background:var(--secondary-light);padding:1rem;border-radius:var(--radius-sm);text-align:center;"><p style="font-size:0.8rem;color:var(--text-muted);">Rating</p><p style="font-size:1.5rem;font-weight:800;color:var(--secondary);">4.8 ⭐</p></div>
        </div>
        <div style="background:#fefce8;padding:1rem;border-radius:var(--radius-sm);margin-bottom:2rem;font-size:0.85rem;color:#854d0e;">🛡️ This service includes a 30-day rework guarantee and is fully insured.</div>
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
                <!-- #21 Stats Cards -->
                <div class="stats-grid" id="stats-grid">
                    <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-value" id="stat-total">-</div><div class="stat-label">Total Bookings</div></div>
                    <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-value" id="stat-pending" style="color:var(--accent);">-</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value" id="stat-completed" style="color:var(--secondary);">-</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-value" style="color:var(--accent);">4.8</div><div class="stat-label">Avg Rating</div></div>
                </div>
                <div class="dashboard-grid">
                    <div class="sidebar">
                        <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(0,0,0,0.05);">
                            <div class="sidebar-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <h3 style="margin-bottom:0.25rem;">${user.name}</h3>
                            <p style="font-size:0.8rem;color:var(--primary);text-transform:capitalize;font-weight:600;">${user.role} Account</p>
                        </div>
                        <ul class="sidebar-nav">
                            <li class="active">📊 Dashboard</li>
                            <li>📜 Past Deals</li>
                            <li>💳 Payments</li>
                            <li>⚙️ Settings</li>
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
            return `
            <div class="card" style="position:relative;overflow:hidden;">
                ${(b.status === 'assigned' || b.status === 'accepted') ? `
                <div class="map-simulation" style="height:100px;background:#eef2ff;margin:-2.5rem -2.5rem 1.5rem -2.5rem;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    <div class="radar-ping"></div>
                    <div style="z-index:2;text-align:center;">
                        <p style="font-size:0.7rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:1px;">Expert On The Way 📍</p>
                        <p style="font-size:0.6rem;color:var(--text-muted);">ETA: 12 mins</p>
                    </div>
                    <div style="position:absolute;width:100%;height:100%;background:url('https://upload.wikimedia.org/wikipedia/commons/e/ed/Map_of_delhi_metro.png');opacity:0.1;background-size:cover;"></div>
                </div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <span class="card-category">${b.serviceId?.category || 'Service'}</span>
                    <span style="font-size:0.75rem;background:${b.status==='completed'?'var(--secondary-light)':b.status==='rejected'?'#fee2e2':'var(--primary-light)'};color:${b.status==='completed'?'var(--secondary)':b.status==='rejected'?'var(--danger)':'var(--primary)'};padding:3px 10px;border-radius:var(--radius-full);font-weight:600;text-transform:capitalize;">${b.status}</span>
                </div>
                <h3 class="card-title">${b.serviceId?.name || 'Service'}</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);">📅 ${new Date(b.date).toDateString()}</p>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;">🕒 ${b.timeSlot}</p>
                <p style="font-size:0.85rem;">📍 ${b.address}</p>
                
                <!-- #5 Timeline -->
                <div class="timeline" style="margin-top:1.25rem;">
                    <div class="timeline-line"><div class="timeline-line-fill" style="width:${Math.max(0, statusIdx) / (statusOrder.length - 1) * 100}%;"></div></div>
                    ${statusOrder.map((st, i) => `<div class="timeline-step ${i < statusIdx ? 'done' : i === statusIdx ? 'active' : ''}"><div class="timeline-dot">${i < statusIdx ? '✓' : i === statusIdx ? '●' : ''}</div><div class="timeline-label">${st}</div></div>`).join('')}
                </div>

                <div style="display:flex;gap:0.5rem;margin-top:1.5rem;">
                    ${(b.status !== 'completed' && b.status !== 'rejected') ? `
                        <button class="btn btn-ghost" style="flex:1;padding:0.5rem;" onclick="openChat('${b._id}','${isProvider ? (b.userId?.name || 'Customer') : (b.providerId?.name || 'Expert')}')">💬 Chat</button>
                    ` : ''}
                    ${b.status === 'completed' ? `
                        <button class="btn btn-outline" style="flex:1;padding:0.5rem;border-color:var(--secondary);color:var(--secondary);" onclick="downloadInvoice('${b._id}')">🧾 Invoice</button>
                    ` : ''}
                </div>

                ${(isProvider && b.status === 'assigned') ? `<div style="margin-top:1.25rem;display:flex;gap:0.5rem;"><button class="btn btn-success" style="flex:1;" onclick="updateBooking('${b._id}','accepted')">Accept ✓</button><button class="btn btn-danger" style="flex:1;" onclick="updateBooking('${b._id}','rejected')">Reject ✕</button></div>` : ''}
                ${(isProvider && b.status === 'accepted') ? `<button class="btn btn-primary" style="width:100%;margin-top:1rem;" onclick="updateBooking('${b._id}','completed')">Mark Completed ✅</button>` : ''}
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Dashboard error:', err);
        bookingsList.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Could not load bookings.</p>`;
    }
}

// ===== AUTH LOGIC =====
async function handleAuth(event, type) {
    event.preventDefault();
    const isRegister = type === 'register';
    const payload = isRegister ? {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        address: document.getElementById('reg-address').value,
        phone: document.getElementById('reg-phone').value
    } : {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };

    if (isRegister) {
        window.pendingRegPayload = payload;
        document.getElementById('otp-modal').style.display = 'flex';
        showToast('Security OTP sent to your phone! 📱', 'info');
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

function moveOTP(input, nextId) {
    if (input.value.length === 1 && nextId) {
        document.getElementById(nextId).focus();
    }
}

async function verifyOTP() {
    const btn = document.querySelector('#otp-modal .btn');
    btn.innerHTML = 'Verifying...';
    
    // Simulate verification
    setTimeout(async () => {
        const payload = window.pendingRegPayload;
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.status === 'success') {
                localStorage.setItem('fixentra_token', data.token);
                localStorage.setItem('fixentra_user', JSON.stringify(data.data.user));
                user = data.data.user; token = data.token;
                showToast(`Welcome to Fixentra, ${user.name}! ✨`, 'success');
                triggerConfetti();
                closeModal('otp-modal');
                initUI();
            } else {
                showToast(data.message || 'Registration failed.', 'error');
                btn.innerHTML = 'Verify & Register →';
            }
        } catch (err) {
            showToast('Registration failed.', 'error');
            btn.innerHTML = 'Verify & Register →';
        }
    }, 1200);
}

function logout() {
    localStorage.removeItem('fixentra_token');
    localStorage.removeItem('fixentra_user');
    user = null; token = null;
    showToast('Logged out successfully.', 'info');
    initUI();
}

// ===== BOOKING =====
function openBookingModal(id, name) {
    if (!token) { showToast('Please login to book a service.', 'warning'); return showView('login'); }
    document.getElementById('modal-service-id').value = id;
    document.getElementById('modal-title').innerText = `Book: ${name}`;
    document.getElementById('booking-modal').style.display = 'flex';
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

document.getElementById('booking-form').onsubmit = async (e) => {
    e.preventDefault();
    const serviceId = document.getElementById('modal-service-id').value;
    const s = allServices.find(x => x._id === serviceId);
    if (!s) return showToast('Error: Service details not found.', 'error');
    
    // 1. Create Order
    let orderData;
    try {
        const orderRes = await fetch(`${API_URL}/api/payments/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: s.price })
        });
        orderData = await orderRes.json();
        if (orderData.status !== 'success') throw new Error(orderData.message);
    } catch (err) {
        return showToast('Failed to initiate payment. ' + err.message, 'error');
    }

    // 2. Open Razorpay
    const options = {
        key: orderData.key_id,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Fixentra",
        description: `Booking: ${s.name}`,
        order_id: orderData.data.id,
        handler: async function (response) {
            // 3. Payment Success -> Create Booking
            const payload = {
                serviceId,
                address: document.getElementById('booking-address').value,
                date: document.getElementById('booking-date').value,
                timeSlot: document.getElementById('booking-timeslot').value
            };
            try {
                const bookingRes = await fetch(`${API_URL}/api/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                const bookingData = await bookingRes.json();
                
                if (bookingData.status === 'success') {
                    // Verify Payment in background
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
        theme: {
            color: "#4f46e5"
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response){
        showToast('Payment Failed. Please try again.', 'error');
    });
    rzp.open();
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

    // Skip if no valid client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER') {
        container.innerHTML = `<p style="text-align:center;color:var(--text-light);font-size:0.8rem;padding:0.5rem;">Google Login available after setup</p>`;
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

// ===== #77 LEADERBOARD VIEW =====
function renderLeaderboard() {
    appContainer.innerHTML = `
        <div class="page-transition container" style="position:relative;padding-bottom:6rem;margin-top:2rem;">
            <div class="breadcrumb"><a onclick="showView('home')">${loc[currentLang].navHome}</a> <span>›</span> <span>Leaderboard</span></div>
            <div style="text-align:center;margin-bottom:3rem;">
                <h2 style="font-size:2.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Top Rated Experts 🏆</h2>
                <p style="color:var(--text-muted);margin-top:1rem;">The highest-rated professionals on Fixentra this month.</p>
            </div>
            <div style="max-width:600px;margin:0 auto;background:var(--card-bg);backdrop-filter:blur(10px);border:var(--glass-border);border-radius:var(--radius);padding:2rem;">
                ${[
                    {n:'Rakesh Sharma',c:'Master Electrician',r:1,pts:'4.9★ (120 jobs)'},
                    {n:'Anita Verma',c:'Deep Cleaning Pro',r:2,pts:'4.8★ (98 jobs)'},
                    {n:'Sunil Kumar',c:'Plumbing Expert',r:3,pts:'4.8★ (85 jobs)'},
                    {n:'Deepak Singh',c:'Carpenter Specialist',r:4,pts:'4.7★ (72 jobs)'},
                    {n:'Priya Desai',c:'Cleaning Expert',r:5,pts:'4.7★ (60 jobs)'}
                ].map(x => `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank rank-${x.r}">${x.r > 3 ? x.r : ['🥇','🥈','🥉'][x.r-1]}</div>
                        <div style="flex:1;">
                            <h4 style="margin-bottom:0.2rem;">${x.n}</h4>
                            <p style="font-size:0.8rem;color:var(--text-muted);">${x.c}</p>
                        </div>
                        <div style="font-weight:700;color:var(--accent);">${x.pts}</div>
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
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
                <div>
                    <h2 style="font-size:3rem;margin-bottom:1.5rem;background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Enterprise Solutions 🏢</h2>
                    <p style="font-size:1.1rem;line-height:1.7;color:var(--text-muted);margin-bottom:2rem;">Manage your office maintenance seamlessly. Book multiple verified experts for deep cleaning, network cabling, AC servicing, and general repairs.</p>
                    <ul style="list-style:none;display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem;">
                        <li style="display:flex;gap:1rem;align-items:center;">✅ <span>Dedicated account manager</span></li>
                        <li style="display:flex;gap:1rem;align-items:center;">✅ <span>Monthly GST-compliant invoicing</span></li>
                        <li style="display:flex;gap:1rem;align-items:center;">✅ <span>Priority response SLAs (2 hours)</span></li>
                    </ul>
                </div>
                <div class="corporate-form">
                    <h3 style="margin-bottom:1.5rem;">Request Corporate Account</h3>
                    <form onsubmit="event.preventDefault(); showToast('Request sent! Our team will contact you within 24 hours.','success'); showView('home');">
                        <div class="form-group"><label>Company Name</label><input type="text" required placeholder="Acme Corp"></div>
                        <div class="form-group"><label>Contact Email</label><input type="email" required placeholder="admin@acme.com"></div>
                        <div class="form-group"><label>Expected Monthly Volume</label><select required><option>1-5 jobs</option><option>5-20 jobs</option><option>20+ jobs</option></select></div>
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
    socket = io();
    
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

-- ============================================
-- FIXENTRA — Supabase PostgreSQL Schema
-- Migrated from MongoDB/Mongoose models
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- Maps from: models/User.js
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- NULL if using Google OAuth
    google_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'provider', 'admin')),
    profile_image TEXT DEFAULT 'default.png',
    skills TEXT[] DEFAULT '{}',
    experience INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 4.50,
    completed_jobs INTEGER DEFAULT 0,
    working_localities TEXT[] DEFAULT '{}',
    response_time_mins INTEGER DEFAULT 18,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,7) DEFAULT 25.6093000,
    longitude NUMERIC(10,7) DEFAULT 85.1376000,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES users(id),
    wallet_balance NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================
-- 2. SERVICES TABLE
-- Maps from: models/Service.js
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('maid', 'electrician', 'plumber', 'appliance repair', 'cleaning', 'carpenter', 'painter', 'pest control')),
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    photo TEXT DEFAULT 'service-default.png',
    gallery TEXT[] DEFAULT '{}',
    included TEXT[] DEFAULT '{}',
    duration_mins INTEGER DEFAULT 60,
    base_eta INTEGER DEFAULT 28,
    rating NUMERIC(3,2) DEFAULT 4.80,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);

-- ============================================
-- 3. BOOKINGS TABLE
-- Maps from: models/Booking.js
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id),
    address TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    locality TEXT DEFAULT 'Patna',
    address_label TEXT,
    family_profile TEXT,
    issue_note TEXT,
    issue_photo_name TEXT,
    issue_photo_url TEXT,
    estimated_arrival_mins INTEGER,
    matched_provider_count INTEGER DEFAULT 0,
    priority_type TEXT DEFAULT 'standard' CHECK (priority_type IN ('standard', 'emergency')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected', 'assigned', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    amount NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(5,2) DEFAULT 0,
    coupon_code TEXT,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'online')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent double bookings for same provider/date/time
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_provider_slot
ON bookings (provider_id, date, time_slot)
WHERE provider_id IS NOT NULL AND status NOT IN ('cancelled', 'rejected');

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings (provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- ============================================
-- 4. REVIEWS TABLE
-- Maps from: models/Review.js
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews (provider_id);

-- ============================================
-- 5. COUPONS TABLE
-- Maps from: models/Coupon.js
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount NUMERIC(5,2) NOT NULL CHECK (discount >= 1 AND discount <= 100),
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    min_order_value NUMERIC(10,2) DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. MESSAGES TABLE
-- Maps from: models/Message.js
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages (booking_id);

-- ============================================
-- 7. AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_reviews BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_coupons BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. AUTO-GENERATE referral_code TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Services: readable by everyone
CREATE POLICY "Services are public" ON services FOR SELECT USING (true);

-- Coupons validate: readable by everyone
CREATE POLICY "Coupons readable" ON coupons FOR SELECT USING (true);

-- Allow service_role (our backend) to do everything
-- The service key bypasses RLS by default, so these policies
-- mainly apply to anon/authenticated direct access.

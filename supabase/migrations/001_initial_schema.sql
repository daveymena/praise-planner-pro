-- Reset schema for SaaS multi-tenancy conversion
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE song_type AS ENUM ('Alabanza', 'Adoración', 'Ministración', 'Congregacional');
CREATE TYPE rehearsal_type AS ENUM ('General', 'Vocal', 'Instrumental');
CREATE TYPE member_role AS ENUM ('Director', 'Vocalista', 'Instrumentista', 'Técnico', 'Coordinador');
CREATE TYPE attendance_status AS ENUM ('confirmed', 'pending', 'absent');
CREATE TYPE service_type AS ENUM ('Domingo Mañana', 'Domingo Noche', 'Miércoles', 'Especial', 'Evento');
CREATE TYPE user_role AS ENUM ('admin', 'member');

-- Ministries table (organizaciones independientes)
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (autenticación)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'member',
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table (integrantes del ministerio)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Si el miembro tiene acceso al sistema
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role member_role NOT NULL,
    instruments TEXT[],
    voice_type VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    joined_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ministry_id, email) -- Email debe ser único por ministerio
);

-- Songs table (repertorio limpio)
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type song_type NOT NULL,
    key VARCHAR(10) NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    lyrics TEXT,
    chords TEXT,
    notes TEXT,
    audio_url TEXT,
    sheet_music_url TEXT,
    youtube_url TEXT,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rehearsals table (ensayos)
CREATE TABLE rehearsals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    type rehearsal_type NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rehearsal songs
CREATE TABLE rehearsal_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rehearsal_id UUID REFERENCES rehearsals(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    order_position INTEGER NOT NULL,
    leader_id UUID REFERENCES members(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rehearsal_id, song_id)
);

-- Rehearsal attendance
CREATE TABLE rehearsal_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rehearsal_id UUID REFERENCES rehearsals(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rehearsal_id, member_id)
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type service_type NOT NULL,
    location VARCHAR(200) NOT NULL,
    theme VARCHAR(300),
    notes TEXT,
    is_completed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service songs
CREATE TABLE service_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    order_position INTEGER NOT NULL,
    leader_id UUID REFERENCES members(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, song_id, order_position)
);

-- Service assignments
CREATE TABLE service_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, member_id, role)
);

-- Ministry rules/norms table
CREATE TABLE ministry_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    order_position INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_songs_ministry ON songs(ministry_id);
CREATE INDEX idx_members_ministry ON members(ministry_id);
CREATE INDEX idx_rehearsals_ministry ON rehearsals(ministry_id);
CREATE INDEX idx_services_ministry ON services(ministry_id);
CREATE INDEX idx_rules_ministry ON ministry_rules(ministry_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON ministries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rehearsals_updated_at BEFORE UPDATE ON rehearsals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rehearsal_attendance_updated_at BEFORE UPDATE ON rehearsal_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ministry_rules_updated_at BEFORE UPDATE ON ministry_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

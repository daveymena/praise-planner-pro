-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE song_type AS ENUM ('Alabanza', 'Adoración', 'Ministración', 'Congregacional');
CREATE TYPE tempo_type AS ENUM ('Rápido', 'Moderado', 'Lento');
CREATE TYPE rehearsal_type AS ENUM ('General', 'Vocal', 'Instrumental');
CREATE TYPE member_role AS ENUM ('Director', 'Vocalista', 'Instrumentista', 'Técnico', 'Coordinador');
CREATE TYPE attendance_status AS ENUM ('confirmed', 'pending', 'absent');
CREATE TYPE service_type AS ENUM ('Domingo Mañana', 'Domingo Noche', 'Miércoles', 'Especial', 'Evento');

-- Members table (integrantes del ministerio)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role member_role NOT NULL,
    instruments TEXT[], -- Array de instrumentos que toca
    voice_type VARCHAR(20), -- Soprano, Alto, Tenor, Bajo
    is_active BOOLEAN DEFAULT true,
    joined_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table (repertorio)
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type song_type NOT NULL,
    key VARCHAR(10) NOT NULL, -- Tonalidad musical
    tempo tempo_type NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    lyrics TEXT,
    chords TEXT,
    notes TEXT,
    audio_url TEXT,
    sheet_music_url TEXT,
    youtube_url TEXT,
    duration_minutes INTEGER,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rehearsals table (ensayos)
CREATE TABLE rehearsals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Rehearsal songs (canciones para cada ensayo)
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

-- Rehearsal attendance (asistencia a ensayos)
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

-- Services table (servicios/cultos)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Service songs (canciones para cada servicio)
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

-- Service assignments (asignaciones para servicios)
CREATE TABLE service_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- Director, Vocalista Principal, Piano, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, member_id, role)
);

-- Ministry rules/norms table
CREATE TABLE ministry_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100), -- Ensayos, Servicios, Vestimenta, etc.
    order_position INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_songs_type ON songs(type);
CREATE INDEX idx_songs_favorite ON songs(is_favorite);
CREATE INDEX idx_rehearsals_date ON rehearsals(date);
CREATE INDEX idx_services_date ON services(date);
CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_rehearsal_attendance_status ON rehearsal_attendance(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rehearsals_updated_at BEFORE UPDATE ON rehearsals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rehearsal_attendance_updated_at BEFORE UPDATE ON rehearsal_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ministry_rules_updated_at BEFORE UPDATE ON ministry_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) is disabled for self-hosted deployment
-- The application layer (Node.js) handles authentication and authorization.

-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rehearsals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rehearsal_songs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rehearsal_attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_songs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ministry_rules ENABLE ROW LEVEL SECURITY;

-- Policies removed as 'authenticated' role does not exist in standard Postgres

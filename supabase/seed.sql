-- Insert sample members
INSERT INTO members (name, email, phone, role, instruments, voice_type, notes) VALUES
('Juan Pérez', 'juan@ministerio.com', '+1234567890', 'Director', '{"Piano", "Guitarra"}', 'Tenor', 'Director musical principal'),
('María González', 'maria@ministerio.com', '+1234567891', 'Vocalista', '{}', 'Soprano', 'Voz principal femenina'),
('Pedro Rodríguez', 'pedro@ministerio.com', '+1234567892', 'Instrumentista', '{"Batería"}', null, 'Baterista principal'),
('Ana López', 'ana@ministerio.com', '+1234567893', 'Vocalista', '{"Guitarra"}', 'Alto', 'Vocalista y guitarrista'),
('Luis Martín', 'luis@ministerio.com', '+1234567894', 'Instrumentista', '{"Bajo"}', 'Bajo', 'Bajista y coros'),
('Carmen Silva', 'carmen@ministerio.com', '+1234567895', 'Vocalista', '{}', 'Soprano', 'Coros y voz principal'),
('David Torres', 'david@ministerio.com', '+1234567896', 'Técnico', '{}', null, 'Sonido y técnica'),
('Elena Ruiz', 'elena@ministerio.com', '+1234567897', 'Coordinador', '{}', 'Alto', 'Coordinadora general'),
('Miguel Ángel', 'miguel@ministerio.com', '+1234567898', 'Instrumentista', '{"Guitarra", "Piano"}', 'Tenor', 'Multi-instrumentista'),
('Sofia Herrera', 'sofia@ministerio.com', '+1234567899', 'Vocalista', '{}', 'Soprano', 'Vocalista joven');

-- Insert sample songs
INSERT INTO songs (name, type, key, tempo, is_favorite, lyrics, notes, duration_minutes, created_by) VALUES
('Cristo Vive', 'Alabanza', 'D', 'Rápido', true, 'Cristo vive, Cristo reina, Cristo volverá...', 'Excelente para apertura de servicio', 4, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Digno es el Señor', 'Adoración', 'G', 'Moderado', true, 'Digno es el Señor de recibir la gloria...', 'Muy poderosa para adoración', 5, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Santo Espíritu', 'Ministración', 'F', 'Lento', false, 'Santo Espíritu ven, llena este lugar...', 'Para momentos de ministración profunda', 6, (SELECT id FROM members WHERE name = 'María González')),
('Gracia Sublime', 'Adoración', 'C', 'Lento', false, 'Sublime gracia del Señor...', 'Clásico himno', 4, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Tu Gracia', 'Ministración', 'E', 'Lento', true, 'Tu gracia me alcanzó...', 'Muy emotiva', 5, (SELECT id FROM members WHERE name = 'Ana López')),
('Grande es el Señor', 'Alabanza', 'A', 'Rápido', false, 'Grande es el Señor y digno de suprema alabanza...', 'Energética', 3, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Cuan Grande es Él', 'Congregacional', 'G', 'Moderado', true, 'Señor mi Dios, al contemplar los cielos...', 'Himno tradicional muy conocido', 4, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Ven Espíritu Ven', 'Ministración', 'D', 'Lento', false, 'Ven Espíritu ven, toca mi corazón...', 'Para invocación', 5, (SELECT id FROM members WHERE name = 'María González')),
('Aleluya', 'Alabanza', 'F', 'Rápido', true, 'Aleluya, aleluya, al Señor cantad...', 'Muy alegre', 3, (SELECT id FROM members WHERE name = 'Ana López')),
('En Tu Presencia', 'Adoración', 'Bb', 'Moderado', true, 'En tu presencia hay plenitud de gozo...', 'Adoración íntima', 6, (SELECT id FROM members WHERE name = 'María González')),
('Jesús es el Señor', 'Congregacional', 'C', 'Moderado', false, 'Jesús es el Señor, Jesús es el Señor...', 'Declaración de fe', 4, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Espíritu Santo Ven', 'Ministración', 'G', 'Lento', true, 'Espíritu Santo ven, muévete en este lugar...', 'Invocación poderosa', 7, (SELECT id FROM members WHERE name = 'María González')),
('Hosanna', 'Alabanza', 'D', 'Rápido', true, 'Hosanna en las alturas...', 'Muy festiva', 4, (SELECT id FROM members WHERE name = 'Ana López')),
('Admirable Dios', 'Adoración', 'A', 'Moderado', false, 'Admirable Dios, Consejero, Príncipe de Paz...', 'Profética', 5, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Te Exaltamos', 'Alabanza', 'E', 'Rápido', false, 'Te exaltamos, te exaltamos, oh Señor...', 'Exaltación', 3, (SELECT id FROM members WHERE name = 'Ana López'));

-- Insert sample rehearsals
INSERT INTO rehearsals (date, time, location, type, notes, created_by) VALUES
('2025-01-16', '19:30', 'Templo Principal', 'General', 'Ensayo para servicio del domingo', (SELECT id FROM members WHERE name = 'Juan Pérez')),
('2025-01-18', '16:00', 'Sala de Ensayo', 'Vocal', 'Trabajar armonías nuevas', (SELECT id FROM members WHERE name = 'María González')),
('2025-01-23', '19:30', 'Templo Principal', 'General', 'Preparación servicio especial', (SELECT id FROM members WHERE name = 'Juan Pérez')),
('2025-01-25', '15:00', 'Sala de Ensayo', 'Instrumental', 'Ensayo solo instrumentos', (SELECT id FROM members WHERE name = 'Pedro Rodríguez')),
('2025-01-30', '19:30', 'Templo Principal', 'General', 'Ensayo general febrero', (SELECT id FROM members WHERE name = 'Juan Pérez'));

-- Insert sample services
INSERT INTO services (name, date, time, type, location, theme, notes, created_by) VALUES
('Servicio Dominical', '2025-01-19', '10:00', 'Domingo Mañana', 'Templo Principal', 'La Gracia de Dios', 'Servicio regular dominical', (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Servicio Vespertino', '2025-01-19', '18:00', 'Domingo Noche', 'Templo Principal', 'Adoración y Alabanza', 'Servicio de adoración', (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Servicio de Oración', '2025-01-22', '19:00', 'Miércoles', 'Templo Principal', 'El Poder de la Oración', 'Servicio de oración', (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Servicio Especial', '2025-01-26', '19:00', 'Especial', 'Templo Principal', 'Noche de Milagros', 'Servicio especial de sanidad', (SELECT id FROM members WHERE name = 'Elena Ruiz'));

-- Insert ministry rules
INSERT INTO ministry_rules (title, content, category, order_position, created_by) VALUES
('Puntualidad en Ensayos', 'Todos los integrantes deben llegar 15 minutos antes del horario establecido para el ensayo.', 'Ensayos', 1, (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Vestimenta para Servicios', 'La vestimenta debe ser formal y apropiada para el servicio. Colores sobrios y elegantes.', 'Servicios', 1, (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Preparación Personal', 'Cada integrante debe estudiar las canciones asignadas antes del ensayo.', 'Ensayos', 2, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Actitud de Adoración', 'Mantener una actitud de reverencia y adoración durante los servicios.', 'Servicios', 2, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Comunicación', 'Cualquier ausencia debe ser comunicada con al menos 24 horas de anticipación.', 'General', 1, (SELECT id FROM members WHERE name = 'Elena Ruiz')),
('Uso de Instrumentos', 'Los instrumentos del ministerio deben ser tratados con cuidado y respeto.', 'Instrumentos', 1, (SELECT id FROM members WHERE name = 'Pedro Rodríguez')),
('Disciplina Espiritual', 'Se espera que todos los integrantes mantengan una vida de oración y lectura bíblica constante.', 'Espiritual', 1, (SELECT id FROM members WHERE name = 'Juan Pérez')),
('Trabajo en Equipo', 'El ministerio funciona como un equipo. La colaboración y el respeto mutuo son fundamentales.', 'General', 2, (SELECT id FROM members WHERE name = 'Elena Ruiz'));

-- Link some songs to rehearsals
INSERT INTO rehearsal_songs (rehearsal_id, song_id, order_position, leader_id) VALUES
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM songs WHERE name = 'Cristo Vive'), 1, (SELECT id FROM members WHERE name = 'Juan Pérez')),
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM songs WHERE name = 'Digno es el Señor'), 2, (SELECT id FROM members WHERE name = 'María González')),
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM songs WHERE name = 'Santo Espíritu'), 3, (SELECT id FROM members WHERE name = 'Ana López'));

-- Add attendance for rehearsals
INSERT INTO rehearsal_attendance (rehearsal_id, member_id, status) VALUES
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM members WHERE name = 'Juan Pérez'), 'confirmed'),
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM members WHERE name = 'María González'), 'confirmed'),
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM members WHERE name = 'Pedro Rodríguez'), 'pending'),
((SELECT id FROM rehearsals WHERE date = '2025-01-16'), (SELECT id FROM members WHERE name = 'Ana López'), 'confirmed');

-- Link songs to services
INSERT INTO service_songs (service_id, song_id, order_position, leader_id) VALUES
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM songs WHERE name = 'Aleluya'), 1, (SELECT id FROM members WHERE name = 'Ana López')),
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM songs WHERE name = 'Digno es el Señor'), 2, (SELECT id FROM members WHERE name = 'María González')),
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM songs WHERE name = 'En Tu Presencia'), 3, (SELECT id FROM members WHERE name = 'María González'));

-- Add service assignments
INSERT INTO service_assignments (service_id, member_id, role) VALUES
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM members WHERE name = 'Juan Pérez'), 'Director Musical'),
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM members WHERE name = 'María González'), 'Vocalista Principal'),
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM members WHERE name = 'Pedro Rodríguez'), 'Batería'),
((SELECT id FROM services WHERE date = '2025-01-19' AND time = '10:00'), (SELECT id FROM members WHERE name = 'Luis Martín'), 'Bajo');
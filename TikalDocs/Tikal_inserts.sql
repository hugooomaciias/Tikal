-- ############################################################## --
-- ########################## TASKS ############################# --
-- ############################################################## --
INSERT INTO projects (name, description, logo_url, is_group_based, deadline, total_logged_minutes, temple_logged_minutes, user_owner_id) VALUES 
('Desarrollo App Tikal', 'Sistema de gestión de productividad y enfoque personal.', 'IconCode', 0, '2026-12-31 23:59:59', 0, 0, 1),
('Máster en Inteligencia Artificial', 'Estudios avanzados de redes neuronales y NLP.', 'IconBook', 0, '2027-06-15 12:00:00', 0, 0, 1),
('Lanzamiento Marca Personal', 'Creación de contenido y presencia en redes para 2026.', 'IconRocket', 0, '2026-08-20 18:30:00', 0, 0, 1);

INSERT INTO stages (name, description, colour, deadline, total_logged_minutes, temple_logged_minutes, project_id) VALUES 
-- Fases para Proyecto 1 (ID 1)
('Backend Core', 'Desarrollo de la API y base de datos.', 'b3', '2026-05-01 10:00:00', 0, 0, 1),
('Frontend UI', 'Diseño de componentes y pantallas con React.', 'b1', '2026-06-01 10:00:00', 0, 0, 1),

-- Fases para Proyecto 2 (ID 2)
('Módulo de Álgebra', 'Repaso de bases matemáticas.', 'y1', '2026-04-30 20:00:00', 0, 0, 2),
('Deep Learning', 'Implementación de modelos con PyTorch.', 'p5', '2026-07-10 15:00:00', 0, 0, 2),

-- Fases para Proyecto 3 (ID 3)
('Estrategia Web', 'Diseño del portfolio y blog.', 'g2', '2026-05-15 09:00:00', 0, 0, 3);

-- Tareas de Backend Core (Stage 1)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Diseñar Esquema ER', 'Definir tablas de Proyectos, Fases y Tareas.', 120, 0, 0.00, '2026-04-25 10:00:00', 0, 0, 8, 1, NULL),
('Configurar Spring Security', 'Implementar JWT y roles de usuario.', 240, 0, 50.00, '2026-04-28 12:00:00', 0, 0, 8, 1, NULL);

-- Tareas de Frontend UI (Stage 2)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Layout Principal', 'Contenedor con Sidebar y Navbar.', 180, 0, 0.00, '2026-05-05 18:00:00', 0, 0, 9, 1, NULL);

-- Subtareas de Layout Principal (ID de tarea padre es 3)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Sidebar Component', 'Menú colapsable con iconos.', 60, 0, 0.00, '2026-05-05 12:00:00', 0, 0, 9, 1, 5),
('User Profile Dropdown', 'Menú de ajustes de usuario.', 45, 0, 0.00, '2026-05-05 14:00:00', 0, 0, 9, 1, 5);

-- Tareas de Módulo de Álgebra (Stage 3)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Estudiar Eigenvectors', 'Lectura capítulo 4 del libro guía.', 90, 0, 0.00, '2026-04-24 16:00:00', 0, 0, 10, 1, NULL),
('Ejercicios de Matrices', 'Resolver guía práctica semanal.', 120, 0, 0.00, '2026-04-26 21:00:00', 0, 0, 10, 1, NULL);

-- Tareas de Estrategia Web (Stage 5)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Comprar Dominio .com', 'Registrar nombre de marca.', 30, 0, 20.00, '2026-05-10 11:00:00', 0, 0, 11, 1, NULL),
('Wireframes Figma', 'Bocetos de baja fidelidad para la landing.', 150, 0, 0.00, '2026-05-12 20:00:00', 0, 0, 11, 1, NULL);

-- Tareas completadas
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id, completion_date) VALUES 
('Estudiar Eigenvectors', 'Lectura capítulo 4 del libro guía.', 90, 1, 0.00, '2026-04-23 16:00:00', 0, 0, 10, 1, NULL, '2026-04-22 16:00:00'),
('Ejercicios de Matrices', 'Resolver guía práctica semanal.', 120, 0, 0.00, '2026-04-23 21:00:00', 0, 0, 10, 1, NULL, NULL),
('Ejercicios de Matrices', 'Resolver guía práctica semanal.', 120, 1, 0.00, '2026-04-21 21:00:00', 0, 0, 10, 1, NULL, '2026-04-23 16:00:00'),
('Estudiar Eigenvectors', 'Resolver guía práctica semanal.', 120, 0, 0.00, '2026-04-21 21:00:00', 0, 0, 10, 1, NULL, NULL);

-- Subtareas de Layout Principal (ID de tarea padre es 3)
INSERT INTO tasks (name, description, estimated_time, is_completed, estimated_profit, deadline, total_logged_minutes, temple_logged_minutes, stage_id, assigned_user_id, parent_task_id) VALUES 
('Sidebar Component', 'Menú colapsable con iconos.', 60, 0, 0.00, '2026-05-05 12:00:00', 0, 0, 9, 1, 8),
('User Profile Dropdown', 'Menú de ajustes de usuario.', 45, 0, 0.00, '2026-05-05 14:00:00', 0, 0, 9, 1, 8);
-- ############################################################## --

-- ############################################################## --
-- ########################## CALENDAR ########################## --
-- ############################################################## --
INSERT INTO calendar_events (name, description, init_date_time, end_date_time, is_activate_tracker, user_id, project_id, stage_id, task_id) VALUES 
-- Sesión de trabajo para el Backend (ID Proyecto 1, ID Fase 1, ID Tarea 1)
('Setup Base de Datos', 'Terminar el diagrama ER y los scripts iniciales.', '2026-04-25 09:00:00', '2026-04-25 11:30:00', 0, 1, 4, 8, 3),

-- Sesión de Frontend (ID Proyecto 1, ID Fase 2, ID Tarea 3)
('Maquetación Sidebar', 'Implementar el diseño responsive del menú.', '2026-04-27 10:00:00', '2026-04-27 12:00:00', 0, 1, 4, 8, 4),

-- Sesión de Estudio Máster (ID Proyecto 2, ID Fase 3, ID Tarea 6)
('Estudio Eigenvectors', 'Repaso para el examen de álgebra.', '2026-04-25 16:00:00', '2026-04-25 18:00:00', 0, 1, 4, 9, 5);

INSERT INTO calendar_events (name, description, init_date_time, end_date_time, is_activate_tracker, user_id, project_id, stage_id, task_id) VALUES 
-- Bloque para Marca Personal (ID Proyecto 3, ID Fase 5)
('Brainstorming Contenido', 'Idear posts para el lanzamiento en redes.', '2026-04-28 17:00:00', '2026-04-28 19:00:00', 0, 1, 5, 11, NULL),

-- Reunión de Sprint (ID Proyecto 1)
('Daily Sync Tikal', 'Revisión de progreso semanal del proyecto.', '2026-04-27 09:00:00', '2026-04-27 09:30:00', 0, 1, 6, NULL, NULL);

INSERT INTO calendar_events (name, description, init_date_time, end_date_time, is_activate_tracker, custom_colour, user_id, project_id, stage_id, task_id) VALUES 
-- Gimnasio (Color Naranja suave - o2)
('Gimnasio', 'Entrenamiento de fuerza.', '2026-04-26 10:00:00', '2026-04-26 11:30:00', 0, '#F4B886', 1, NULL, NULL, NULL),

-- Comida familiar (Color Rosa - p1)
('Comida Familiar', 'Cumpleaños en casa de los abuelos.', '2026-04-26 14:00:00', '2026-04-26 16:30:00', 0, '#FADADD', 1, NULL, NULL, NULL),

-- Deep Work Independiente (Color Azul oscuro - b3)
('Lectura Técnica', 'Leer artículos sobre Arquitectura Hexagonal.', '2026-04-29 08:00:00', '2026-04-29 09:00:00', 0, '#3f6c7b', 1, NULL, NULL, NULL);
-- ############################################################## --
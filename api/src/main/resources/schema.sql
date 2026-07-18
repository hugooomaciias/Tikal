-- INSERTS PARA LA TABLA rank_lists

INSERT IGNORE INTO rank_lists (id, temple_name, awarded_title, required_hours, next_hours, badge_image_url, clock_image_url, colour, temple_image_url) VALUES
                                                                                            (1, 'Templo de los Orígenes',       'Aprendiz maya',                  0, 80, 'src/assets/temple-mode/aprendiz-maya.svg', '/images/temple/clock1.png', '#63A47D', '/images/temple/templeLogo1.png'),
                                                                                            (2, 'Templo del Camino Interior',   'Iniciado del Agua y del Fuego',  80, 250, 'src/assets/temple-mode/iniciado-agua-fuego.svg', '/images/temple/clock2.png', '#2AB7CA', '/images/temple/templeLogo2.png'),
                                                                                            (3, 'Templo de la Sabiduría',       'Guía del Sendero Secreto',       250, 700, 'src/assets/temple-mode/guia-sendero-secreto.svg', '/images/temple/clock3.png', '#C88A2A', '/images/temple/templeLogo3.png'),
                                                                                            (4, 'Templo del Sol',               'Sabio del Tiempo',               700, 1024, 'src/assets/temple-mode/sabio-tiempo.svg', '/images/temple/clock4.png', '#F87171', '/images/temple/templeLogo4.png'),
                                                                                            (5, 'Gran Pirámide de Tikal',       'Señor del Quinto Sol',           1024, 1024, 'src/assets/temple-mode/senor-quinto-sol.svg', '/images/temple/clock4.png', '#EFBF04', '/images/temple/templeLogo5.png');


-- INSERTS PARA LA TABLA totem_lists

-- ==========================================
-- Tótems del Nivel 1 (required_rank = 1)
-- ==========================================
INSERT IGNORE INTO totem_lists (id, name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
                                                                                                                               (1, 'IMIX', 'Alcanza 10 horas totales de concentración', 10, 'CONCENTRATION', 1, '/images/totems/imix.svg'),
                                                                                                                               (2, 'IK', 'Alcanza 25 horas totales de concentración', 25, 'CONCENTRATION', 1, '/images/totems/ik.svg'),
                                                                                                                               (3, 'AKBAL', 'Alcanza 50 horas totales de concentración', 50, 'CONCENTRATION', 1, '/images/totems/akbal.svg'),
                                                                                                                               (4, 'KAN', 'Alcanza una precisión de planificación superior al 60%', 60, 'PLANNING_ACCURACY', 1, '/images/totems/kan.svg'),
                                                                                                                               (5, 'CHIKCHAN', 'Alcanza una efectividad global superior al 65%', 65, 'GLOBAL_EFFECTIVENESS', 1, '/images/totems/chikchan.svg');

-- ==========================================
-- Tótems del Nivel 2 (required_rank = 2)
-- ==========================================
INSERT IGNORE INTO totem_lists (id, name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
                                                                                                                               (6, 'KIMI', 'Alcanza 100 horas totales de concentración', 100, 'CONCENTRATION', 2, '/images/totems/kimi.svg'),
                                                                                                                               (7, 'MANIK', 'Alcanza 150 horas totales de concentración', 150, 'CONCENTRATION', 2, '/images/totems/manik.svg'),
                                                                                                                               (8, 'LAMAT', 'Alcanza 200 horas totales de concentración', 200, 'CONCENTRATION', 2, '/images/totems/lamat.svg'),
                                                                                                                               (9, 'MULUK', 'Alcanza precisión de planificación > 70% y completa 50 tareas con estimación', 70, 'PLANNING_ACCURACY_WITH_TASKS', 2, '/images/totems/muluk.svg'),
                                                                                                                               (10, 'OK', 'Alcanza efectividad global > 75% y completa 30 tareas', 75, 'EFFECTIVENESS_WITH_TASKS', 2, '/images/totems/ok.svg');

-- ==========================================
-- Tótems del Nivel 3 (required_rank = 3)
-- ==========================================
INSERT IGNORE INTO totem_lists (id, name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
                                                                                                                               (11, 'CHUWEN', 'Alcanza 300 horas totales de concentración', 300, 'CONCENTRATION', 3, '/images/totems/chuwen.svg'),
                                                                                                                               (12, 'EB', 'Alcanza 400 horas totales de concentración', 400, 'CONCENTRATION', 3, '/images/totems/eb.svg'),
                                                                                                                               (13, 'BEN', 'Alcanza 500 horas totales de concentración', 500, 'CONCENTRATION', 3, '/images/totems/ben.svg'),
                                                                                                                               (14, 'IX', 'Alcanza 600 horas totales de concentración', 600, 'CONCENTRATION', 3, '/images/totems/ix.svg'),
                                                                                                                               (15, 'MEN', 'Alcanza precisión de planificación > 80% y completa 100 tareas con estimación', 80, 'PLANNING_ACCURACY_WITH_TASKS', 3, '/images/totems/men.svg'),
                                                                                                                               (16, 'KIB', 'Alcanza efectividad global > 85% y mantén una racha de 7 días con efectividad > 75%', 85, 'EFFECTIVENESS_WITH_STREAK', 3, '/images/totems/kib.svg');

-- ==========================================
-- Tótems del Nivel 4 (required_rank = 4)
-- ==========================================
INSERT IGNORE INTO totem_lists (id, name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
                                                                                                                               (17, 'KABAN', 'Alcanza 800 horas totales de concentración', 800, 'CONCENTRATION', 4, '/images/totems/kaban.svg'),
                                                                                                                               (18, 'ETZNAB', 'Alcanza 1000 horas totales de concentración', 1000, 'CONCENTRATION', 4, '/images/totems/etznab.svg'),
                                                                                                                               (19, 'KAWAK', 'Alcanza precisión de planificación > 90% y efectividad global > 90%', 90, 'PLANNING_AND_EFFECTIVENESS', 4, '/images/totems/kawak.svg'),
                                                                                                                               (20, 'AJAW', 'Desbloquea todos los tótems anteriores', 20, 'ALL_PREVIOUS_TOTEMS', 4, '/images/totems/ajaw.svg');


-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
-- CREATE INDEX IF NOT EXISTS idx_time_logs_user_init ON time_logs(user_id, init_date_time);
-- CREATE INDEX IF NOT EXISTS idx_time_logs_user_temple ON time_logs(user_id, is_temple_mode, end_date_time);
-- CREATE INDEX IF NOT EXISTS idx_time_logs_user_completed ON time_logs(user_id, is_completed);
-- CREATE INDEX IF NOT EXISTS idx_tasks_user_completed_estimate ON tasks(assigned_user_id, is_completed, estimated_time);
-- sCREATE INDEX IF NOT EXISTS idx_tasks_parent_completed ON tasks(parent_task_id, is_completed);

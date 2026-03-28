-- INSERTS PARA LA TABLA rank_lists

INSERT IGNORE INTO rank_lists (id, temple_name, awarded_title, required_hours) VALUES
                                                                                            (1, 'Templo de los Orígenes',       'Aprendiz maya',                  0),
                                                                                            (2, 'Templo del Camino Interior',   'Iniciado del Agua y del Fuego',  70),
                                                                                            (3, 'Templo de la Sabiduría',       'Guía del Sendero Secreto',       140),
                                                                                            (4, 'Templo del Sol',               'Sabio del Tiempo',               260),
                                                                                            (5, 'Gran Pirámide de Tikal',       'Señor del Quinto Sol',           420);


-- INSERTS PARA LA TABLA totem_lists
-- Tótems del Nivel 1 (required_rank = 1)

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('IMIX', 'Alcanza 10 horas totales de concentración', 10, 'CONCENTRATION', 1, '/images/totems/imix.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('IK', 'Alcanza 25 horas totales de concentración', 25, 'CONCENTRATION', 1, '/images/totems/ik.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('AKBAL', 'Alcanza 50 horas totales de concentración', 50, 'CONCENTRATION', 1, '/images/totems/akbal.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('KAN', 'Alcanza una precisión de planificación superior al 60%', 60, 'PLANNING_ACCURACY', 1, '/images/totems/kan.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('CHIKCHAN', 'Alcanza una efectividad global superior al 65%', 65, 'GLOBAL_EFFECTIVENESS', 1, '/images/totems/chikchan.svg');

-- Tótems del Nivel 2 (required_rank = 2)

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('KIMI', 'Alcanza 100 horas totales de concentración', 100, 'CONCENTRATION', 2, '/images/totems/kimi.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('MANIK', 'Alcanza 150 horas totales de concentración', 150, 'CONCENTRATION', 2, '/images/totems/manik.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('LAMAT', 'Alcanza 200 horas totales de concentración', 200, 'CONCENTRATION', 2, '/images/totems/lamat.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('MULUK', 'Alcanza precisión de planificación > 70% y completa 50 tareas con estimación', 70, 'PLANNING_ACCURACY_WITH_TASKS', 2, '/images/totems/muluk.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('OK', 'Alcanza efectividad global > 75% y completa 30 tareas', 75, 'EFFECTIVENESS_WITH_TASKS', 2, '/images/totems/ok.svg');

-- Tótems del Nivel 3 (required_rank = 3)

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('CHUWEN', 'Alcanza 300 horas totales de concentración', 300, 'CONCENTRATION', 3, '/images/totems/chuwen.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('EB', 'Alcanza 400 horas totales de concentración', 400, 'CONCENTRATION', 3, '/images/totems/eb.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('BEN', 'Alcanza 500 horas totales de concentración', 500, 'CONCENTRATION', 3, '/images/totems/ben.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('IX', 'Alcanza 600 horas totales de concentración', 600, 'CONCENTRATION', 3, '/images/totems/ix.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('MEN', 'Alcanza precisión de planificación > 80% y completa 100 tareas con estimación', 80, 'PLANNING_ACCURACY_WITH_TASKS', 3, '/images/totems/men.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('KIB', 'Alcanza efectividad global > 85% y mantén una racha de 7 días con efectividad > 75%', 85, 'EFFECTIVENESS_WITH_STREAK', 3, '/images/totems/kib.svg');

-- Tótems del Nivel 4 (required_rank = 4)

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('KABAN', 'Alcanza 800 horas totales de concentración', 800, 'CONCENTRATION', 4, '/images/totems/kaban.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('ETZNAB', 'Alcanza 1000 horas totales de concentración', 1000, 'CONCENTRATION', 4, '/images/totems/etznab.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('KAWAK', 'Alcanza precisión de planificación > 90% y efectividad global > 90%', 90, 'PLANNING_AND_EFFECTIVENESS', 4, '/images/totems/kawak.svg');

INSERT IGNORE INTO totem_lists (name, goal_description, target_progress, type_of_goal, required_rank, totem_image_url) VALUES
    ('AJAW', 'Desbloquea todos los tótems anteriores', 20, 'ALL_PREVIOUS_TOTEMS', 4, '/images/totems/ajaw.svg');


-- TRIGGERS PARA TIME LOGS

---------------------------------------------------------
-----  Trigger para después de insertar un time_log -----
---------------------------------------------------------

DELIMITER $$

CREATE TRIGGER after_time_log_insert
    AFTER INSERT ON time_logs
    FOR EACH ROW
BEGIN
    DECLARE session_mins INT DEFAULT 0;
    DECLARE temple_mins INT DEFAULT 0;
    DECLARE parent_id INT DEFAULT NULL;

    -- Solo sumamos si el temporizador realmente se detuvo
    IF NEW.end_date_time IS NOT NULL THEN
        -- 1. Calculamos los minutos de esta sesión
        SET session_mins = TIMESTAMPDIFF(MINUTE, NEW.init_date_time, NEW.end_date_time);

        IF NEW.is_temple_mode = 1 THEN
            SET temple_mins = session_mins;
        END IF;

        -- 2. Propagamos al Proyecto
        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects
            SET total_logged_minutes = total_logged_minutes + session_mins,
                temple_logged_minutes = temple_logged_minutes + temple_mins
            WHERE id = NEW.project_id;
        END IF;

        -- 3. Propagamos a la Fase
        IF NEW.stage_id IS NOT NULL THEN
            UPDATE stages
            SET total_logged_minutes = total_logged_minutes + session_mins,
                temple_logged_minutes = temple_logged_minutes + temple_mins
            WHERE id = NEW.stage_id;
        END IF;

        -- 4. Propagamos a la Tarea (y a su Padre si es una Subtarea)
        IF NEW.task_id IS NOT NULL THEN
            -- Actualizar la propia tarea/subtarea
            UPDATE tasks
            SET total_logged_minutes = total_logged_minutes + session_mins,
                temple_logged_minutes = temple_logged_minutes + temple_mins
            WHERE id = NEW.task_id;

            -- Buscar si tiene un padre y actualizarlo también
            SELECT parent_task_id INTO parent_id FROM tasks WHERE id = NEW.task_id;
            IF parent_id IS NOT NULL THEN
                UPDATE tasks
                SET total_logged_minutes = total_logged_minutes + session_mins,
                    temple_logged_minutes = temple_logged_minutes + temple_mins
                WHERE id = parent_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

---------------------------------------------------------------------
----- Trigger que se ejecutará después de eliminar un time log  -----
---------------------------------------------------------------------

DELIMITER $$

CREATE TRIGGER after_time_log_delete
    AFTER DELETE ON time_logs
    FOR EACH ROW
BEGIN
    DECLARE session_mins INT DEFAULT 0;
    DECLARE temple_mins INT DEFAULT 0;
    DECLARE parent_id INT DEFAULT NULL;

    IF OLD.end_date_time IS NOT NULL THEN
        SET session_mins = TIMESTAMPDIFF(MINUTE, OLD.init_date_time, OLD.end_date_time);

        IF OLD.is_temple_mode = 1 THEN
            SET temple_mins = session_mins;
        END IF;

        IF OLD.project_id IS NOT NULL THEN
            UPDATE projects
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - temple_mins)
            WHERE id = OLD.project_id;
        END IF;

        IF OLD.stage_id IS NOT NULL THEN
            UPDATE stages
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - temple_mins)
            WHERE id = OLD.stage_id;
        END IF;

        IF OLD.task_id IS NOT NULL THEN
            UPDATE tasks
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - temple_mins)
            WHERE id = OLD.task_id;

            SELECT parent_task_id INTO parent_id FROM tasks WHERE id = OLD.task_id;
            IF parent_id IS NOT NULL THEN
                UPDATE tasks
                SET total_logged_minutes = GREATEST(0, total_logged_minutes - session_mins),
                    temple_logged_minutes = GREATEST(0, temple_logged_minutes - temple_mins)
                WHERE id = parent_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

-----------------------------------------------
-----  Trigger al actualizar un time log  -----
-----------------------------------------------

DELIMITER $$

CREATE TRIGGER after_time_log_update
AFTER UPDATE ON time_logs
FOR EACH ROW
BEGIN
    -- Variables para lo viejo
    DECLARE old_session_mins INT DEFAULT 0;
    DECLARE old_temple_mins INT DEFAULT 0;
    DECLARE old_parent_id INT DEFAULT NULL;
    
    -- Variables para lo nuevo
    DECLARE new_session_mins INT DEFAULT 0;
    DECLARE new_temple_mins INT DEFAULT 0;
    DECLARE new_parent_id INT DEFAULT NULL;

    -- ==========================================
    -- 1. REVERTIMOS LOS VALORES ANTERIORES (OLD)
    -- ==========================================
    IF OLD.end_date_time IS NOT NULL THEN
        SET old_session_mins = TIMESTAMPDIFF(MINUTE, OLD.init_date_time, OLD.end_date_time);
        IF OLD.is_temple_mode = 1 THEN SET old_temple_mins = old_session_mins; END IF;

        IF OLD.project_id IS NOT NULL THEN
            UPDATE projects 
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - old_session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - old_temple_mins)
            WHERE id = OLD.project_id;
        END IF;

        IF OLD.stage_id IS NOT NULL THEN
            UPDATE stages 
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - old_session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - old_temple_mins)
            WHERE id = OLD.stage_id;
        END IF;

        IF OLD.task_id IS NOT NULL THEN
            UPDATE tasks 
            SET total_logged_minutes = GREATEST(0, total_logged_minutes - old_session_mins),
                temple_logged_minutes = GREATEST(0, temple_logged_minutes - old_temple_mins)
            WHERE id = OLD.task_id;

            SELECT parent_task_id INTO old_parent_id FROM tasks WHERE id = OLD.task_id;
            IF old_parent_id IS NOT NULL THEN
                UPDATE tasks 
                SET total_logged_minutes = GREATEST(0, total_logged_minutes - old_session_mins),
                    temple_logged_minutes = GREATEST(0, temple_logged_minutes - old_temple_mins)
                WHERE id = old_parent_id;
            END IF;
        END IF;
    END IF;

    -- ==========================================
    -- 2. APLICAMOS LOS VALORES NUEVOS (NEW)
    -- ==========================================
    IF NEW.end_date_time IS NOT NULL THEN
        SET new_session_mins = TIMESTAMPDIFF(MINUTE, NEW.init_date_time, NEW.end_date_time);
        IF NEW.is_temple_mode = 1 THEN SET new_temple_mins = new_session_mins; END IF;

        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects 
            SET total_logged_minutes = total_logged_minutes + new_session_mins,
                temple_logged_minutes = temple_logged_minutes + new_temple_mins
            WHERE id = NEW.project_id;
        END IF;

        IF NEW.stage_id IS NOT NULL THEN
            UPDATE stages 
            SET total_logged_minutes = total_logged_minutes + new_session_mins,
                temple_logged_minutes = temple_logged_minutes + new_temple_mins
            WHERE id = NEW.stage_id;
        END IF;

        IF NEW.task_id IS NOT NULL THEN
            UPDATE tasks 
            SET total_logged_minutes = total_logged_minutes + new_session_mins,
                temple_logged_minutes = temple_logged_minutes + new_temple_mins
            WHERE id = NEW.task_id;

            SELECT parent_task_id INTO new_parent_id FROM tasks WHERE id = NEW.task_id;
            IF new_parent_id IS NOT NULL THEN
                UPDATE tasks 
                SET total_logged_minutes = total_logged_minutes + new_session_mins,
                    temple_logged_minutes = temple_logged_minutes + new_temple_mins
                WHERE id = new_parent_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

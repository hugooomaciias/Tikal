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


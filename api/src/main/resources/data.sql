
------------------------------------------------------
-----  Estas son las vistas que se usa 
------------------------------------------------------

-- Funcionalidad de la vista: mirar cada tarea que tenga un estimated profit y 
-- ver cuántos euros equivale un minuto de trabajo en esta tarea.

-- Si la tarea estima 120 min y 100€: 0.83 €/min
-- Si la tarea no tenía tiempo estimado, pero ya se completó y el usuario tardó 200 min.

CREATE OR REPLACE VIEW task_profit_rate_view AS
SELECT 
    t.id AS task_id,
    t.estimated_profit,
    t.estimated_time,
    t.total_logged_minutes AS actual_total_time,
    CASE 
        -- Caso 1: Tiene tiempo estimado
        WHEN t.estimated_time IS NOT NULL AND t.estimated_time > 0 
        THEN (t.estimated_profit / t.estimated_time)
        
        -- Caso 2: NO tiene tiempo estimado, pero SÍ está completada y tiene tiempo real
        WHEN (t.estimated_time IS NULL OR t.estimated_time = 0) 
             AND t.is_completed = 1 
             AND t.total_logged_minutes > 0 
        THEN (t.estimated_profit / t.total_logged_minutes)
        
        -- Caso 3: No cumple para calcular rentabilidad
        ELSE 0 
    END AS profit_per_minute
FROM tasks t
WHERE t.estimated_profit IS NOT NULL AND t.estimated_profit > 0;


-- Daily profitability view

CREATE OR REPLACE VIEW daily_profitability_view AS
SELECT 
    tl.user_id,
    DATE(tl.init_date_time) AS log_date,
    SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time)) AS daily_minutes,
    
    -- Multiplicamos los minutos de cada log por la tasa de su tarea
    SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time) * COALESCE(tpr.profit_per_minute, 0)) AS daily_profit,
    
    -- Calculamos el ratio medio del día (Euros por minuto globales del día)
    CASE 
        WHEN SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time)) > 0 
        THEN SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time) * COALESCE(tpr.profit_per_minute, 0)) / SUM(TIMESTAMPDIFF(MINUTE, tl.init_date_time, tl.end_date_time))
        ELSE 0 
    END AS daily_profit_per_minute

FROM time_logs tl
LEFT JOIN tasks t ON tl.task_id = t.id
-- Buscamos la tasa de ganancia (ya sea en la propia tarea o en su padre si es subtarea)
LEFT JOIN task_profit_rate_view tpr ON (t.id = tpr.task_id OR t.parent_task_id = tpr.task_id)
WHERE tl.end_date_time IS NOT NULL
GROUP BY tl.user_id, DATE(tl.init_date_time);


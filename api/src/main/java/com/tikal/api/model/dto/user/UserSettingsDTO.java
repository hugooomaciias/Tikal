package com.tikal.api.model.dto.user;

import com.tikal.api.model.entity.enumerated.DayOfWeekSetting;
import com.tikal.api.model.entity.enumerated.SupportedLanguages;
import com.tikal.api.model.entity.enumerated.ThemeSetting;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDTO {

    // --- General Settings ---
    @io.swagger.v3.oas.annotations.media.Schema(description = "Tema de la aplicación", example = "CLARO", allowableValues = {"CLARO","OSCURO","MAYA"})
    private ThemeSetting theme;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Rango de tiempo preferido", example = "MENSUAL", allowableValues = {"SEMANAL","MENSUAL","TRIMESTRAL","ANUAL","GLOBAL"})
    private TimeRangeSetting timeRange;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Meta de horas por periodo", example = "40")
    private Integer hoursGoal;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Duración en minutos de la sesión de enfoque", example = "25")
    private Integer focusSessionMinutes;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Zona horaria IANA del usuario", example = "America/Argentina/Buenos_Aires")
    private String timezone;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Primer día de la semana", example = "LUNES", allowableValues = {"LUNES","DOMINGO"})
    private DayOfWeekSetting firstDayOfWeek;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Mostrar ranking en equipos", example = "true")
    private Boolean showRankInTeam;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Idioma del usuario", example = "ES", allowableValues = {"ES","EN"})
    private SupportedLanguages userLanguage;

    // --- JSON metadata ---
    @io.swagger.v3.oas.annotations.media.Schema(description = "Metadatos con la disposición de widgets en el dashboard")
    private LayoutsDashboardMetadata layoutsDashboards;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Preferencias específicas por widget (mapa dinámico)", example = "{}")
    private WidgetPreferencesMetadata widgetPreferences;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Preferencias de notificación del usuario")
    private NotificationSettingsMetadata notificationSettings;
}
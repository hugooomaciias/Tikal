# Estructura de carpetas del proyecto `api/`

Este archivo muestra una representación completa en árbol (snapshot) de la estructura de carpetas del proyecto, incluyendo todos los archivos Java dentro de los directorios de configuración, controladores, excepciones, modelos, repositorios, servicios y utilidades.

```
api/
├── actual_queries.txt
├── docker-compose.yaml
├── file.txt
├── mvnw
├── mvnw.cmd
├── old_queries.txt
├── pom.xml
├── README.md
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── tikal/
│   │   │           └── api/
│   │   │               ├── ApiApplication.java
│   │   │               ├── config/
│   │   │               │   ├── AppConfig.java
│   │   │               │   ├── CustomUserDetails.java
│   │   │               │   ├── JwtAuthFilter.java
│   │   │               │   ├── JwtService.java
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   └── SwaggerConfig.java
│   │   │               ├── controller/
│   │   │               │   ├── AuthController.java
│   │   │               │   ├── CalendarEventController.java
│   │   │               │   ├── DashboardController.java
│   │   │               │   ├── ProjectController.java
│   │   │               │   ├── StageController.java
│   │   │               │   ├── TaskController.java
│   │   │               │   ├── TimeLogController.java
│   │   │               │   └── UserSettingsController.java
│   │   │               ├── exception/
│   │   │               │   ├── BadRequestException.java
│   │   │               │   ├── ConflictException.java
│   │   │               │   ├── ForbiddenAccessException.java
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   ├── ResourceNotFoundException.java
│   │   │               │   ├── UnauthorizedException.java
│   │   │               │   └── dto/
│   │   │               │       └── ErrorResponse.java
│   │   │               ├── model/
│   │   │               │   ├── dto/
│   │   │               │   │   ├── TeamDTO.java
│   │   │               │   │   ├── TeamMemberDTO.java
│   │   │               │   │   ├── TimeLogDTO.java
│   │   │               │   │   ├── UserDTO.java
│   │   │               │   │   ├── UserSettingsDTO.java
│   │   │               │   │   ├── auth/
│   │   │               │   │   │   ├── ForgotPasswordRequest.java
│   │   │               │   │   │   ├── GoogleLoginRequest.java
│   │   │               │   │   │   ├── LoginRequest.java
│   │   │               │   │   │   ├── LogoutRequest.java
│   │   │               │   │   │   ├── MessageResponse.java
│   │   │               │   │   │   ├── RegisterRequest.java
│   │   │               │   │   │   ├── ResetPasswordRequest.java
│   │   │               │   │   │   ├── TokenResponse.java
│   │   │               │   │   │   └── VerifyOtpRequest.java
│   │   │               │   │   ├── calendar/
│   │   │               │   │   │   ├── CalendarEventDTO.java
│   │   │               │   │   │   ├── CalendarEventRequest.java
│   │   │               │   │   │   └── ChangeTimeRequest.java
│   │   │               │   │   ├── sync/
│   │   │               │   │   │   ├── WorkspaceSyncDTO.java
│   │   │               │   │   │   ├── domain/
│   │   │               │   │   │   │   ├── GamificationEventDTO.java
│   │   │               │   │   │   │   ├── ProjectSyncDTO.java
│   │   │               │   │   │   │   ├── StageSyncDTO.java
│   │   │               │   │   │   │   ├── SubtaskSyncDTO.java
│   │   │               │   │   │   │   └── TaskSyncDTO.java
│   │   │               │   │   │   └── widgets/
│   │   │               │   │   │       ├── AiAdviceWidgetData.java
│   │   │               │   │   │       ├── CalendarWidgetData.java
│   │   │               │   │   │       ├── ComparisonWidgetData.java
│   │   │               │   │   │       ├── ConcentrationHeatmapWidgetData.java
│   │   │               │   │   │       ├── EffectivenessChartWidgetData.java
│   │   │               │   │   │       ├── SolarChartWidgetData.java
│   │   │               │   │   │       ├── TaskWidgetData.java
│   │   │               │   │   │       ├── TempleModeWidgetData.java
│   │   │               │   │   │       ├── TimeGoalWidgetData.java
│   │   │               │   │   │       ├── TimeLogWidgetData.java
│   │   │               │   │   │       ├── TimeTrackerWidgetData.java
│   │   │               │   │   │       ├── WeeklyProgressWidgetData.java
│   │   │               │   │   │       └── WidgetData.java
│   │   │               │   │   ├── task/
│   │   │               │   │   │   ├── CreateProjectRequest.java
│   │   │               │   │   │   ├── ProjectDTO.java
│   │   │               │   │   │   ├── StageDTO.java
│   │   │               │   │   │   ├── StageRequest.java
│   │   │               │   │   │   ├── TaskDTO.java
│   │   │               │   │   │   ├── TaskRequest.java
│   │   │               │   │   │   └── UpdateProjectRequest.java
│   │   │               │   │   └── timer/
│   │   │               │   │       ├── ActiveTimerDTO.java
│   │   │               │   │       ├── TimeLogBatchRequest.java
│   │   │               │   │       ├── TimeLogPause.java
│   │   │               │   │       └── TimeLogRequest.java
│   │   │               │   ├── entity/
│   │   │               │   │   ├── CalendarEvent.java
│   │   │               │   │   ├── Message.java
│   │   │               │   │   ├── PasswordResetOtp.java
│   │   │               │   │   ├── Project.java
│   │   │               │   │   ├── RankList.java
│   │   │               │   │   ├── RefreshToken.java
│   │   │               │   │   ├── Stage.java
│   │   │               │   │   ├── Task.java
│   │   │               │   │   ├── Team.java
│   │   │               │   │   ├── TeamMember.java
│   │   │               │   │   ├── TimeLog.java
│   │   │               │   │   ├── TotemInventory.java
│   │   │               │   │   ├── TotemList.java
│   │   │               │   │   ├── User.java
│   │   │               │   │   ├── UserSettings.java
│   │   │               │   │   ├── enumerated/
│   │   │               │   │   │   ├── DayOfWeekSetting.java
│   │   │               │   │   │   ├── EventType.java
│   │   │               │   │   │   ├── ProjectType.java
│   │   │               │   │   │   ├── SubscriptionPlan.java
│   │   │               │   │   │   ├── SupportedLanguages.java
│   │   │               │   │   │   ├── ThemeSetting.java
│   │   │               │   │   │   ├── TimeRangeSetting.java
│   │   │               │   │   │   └── TypeOfGoal.java
│   │   │               │   │   └── metadata/
│   │   │               │   │       ├── LayoutsDashboardMetadata.java
│   │   │               │   │       ├── NotificationSettingsMetadata.java
│   │   │               │   │       └── WidgetPreferencesMetadata.java
│   │   │               ├── repository/
│   │   │               │   ├── CalendarEventRepository.java
│   │   │               │   ├── MessageRepository.java
│   │   │               │   ├── PasswordResetOtpRepository.java
│   │   │               │   ├── ProjectRepository.java
│   │   │               │   ├── RankListRepository.java
│   │   │               │   ├── StageRepository.java
│   │   │               │   ├── TaskRepository.java
│   │   │               │   ├── TeamMemberRepository.java
│   │   │               │   ├── TeamRepository.java
│   │   │               │   ├── TimeLogRepository.java
│   │   │               │   ├── TokenRepository.java
│   │   │               │   ├── TotemInventoryRepository.java
│   │   │               │   ├── TotemListRepository.java
│   │   │               │   ├── UserRepository.java
│   │   │               │   └── UserSettingsRepository.java
│   │   │               ├── service/
│   │   │               │   ├── AuthService.java
│   │   │               │   ├── CalendarEventService.java
│   │   │               │   ├── ChatService.java
│   │   │               │   ├── DashboardService.java
│   │   │               │   ├── EmailService.java
│   │   │               │   ├── GamificationService.java
│   │   │               │   ├── ProjectService.java
│   │   │               │   ├── SettingsService.java
│   │   │               │   ├── StageService.java
│   │   │               │   ├── StatisticsService.java
│   │   │               │   ├── TaskService.java
│   │   │               │   ├── TeamService.java
│   │   │               │   ├── TimeLogService.java
│   │   │               │   ├── TimeService.java
│   │   │               │   ├── UserOnboardingService.java
│   │   │               │   ├── UserService.java
│   │   │               │   ├── WidgetBuilderService.java
│   │   │               │   └── cache/
│   │   │               │       ├── PreFetchedDashboardData.java
│   │   │               │       └── SyncCache.java
│   │   │               └── utils/
│   │   │                   └── DateUtils.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── data.sql
│   │       ├── schema.sql
│   │       ├── textFile
│   │       └── images/
│   │           └── logo-tikal.png
│   └── test/
│       └── java/
│           └── com/
│               └── tikal/
│                   └── api/
│                       └── ApiApplicationTests.java
└── ...otros archivos y carpetas generados (target/, etc.)
```

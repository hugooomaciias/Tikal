La distribución de carpetas es tal que así:

```text

src/main/java/com/tikal/backend
│
├── config/           # Configuraciones (CORS, Seguridad, Swagger, Beans de IA)
│   ├── AppConfig.java
│   └── JwtService.java
├── controller/       # Aquí llegan las peticiones HTTP (Solo llaman al servicio)
│   ├── AuthController.java
│   ├── DashboardController.java
│   └── TaskController.java
│
├── service/          # AQUÍ va la lógica de negocio (Cálculo de rangos, penalizaciones)
│   ├── impl/
│   ├── UserService.java
│   └── GamificacionService.java
│
├── repository/       # Interfaces que extienden JpaRepository (SQL queries)
│   ├── UserRepository.java
│   └── MessageRepository.java
│
├── model/            # Tus datos
│   ├── dto/          # Las dtos para enviar solo la informacion necesaria al cliente
│   │   ├── UserDTO.java
│   ├── enumerated/         # Los enumerados que se usan
│   │   ├── SubscriptionPlan.java
│   ├── metadata/     # Las clases que se usan para guardar los json de configuración
│   │   ├── LayoutsDashboardMetadata.java
│   └── entity/       # Las clases que replican tus tablas SQL (JPA)
│       ├── User.java
│       ├── Task.java
│       └── RankList.java
│
└── exception/        # Manejo de errores global (para no enviar trazas feas al front)
    └── NotFoundUserException.java

```

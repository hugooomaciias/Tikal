La distribución de carpetas se hará tal que así:

```text

src/main/java/com/tikal/backend
│
├── config/           # Configuraciones (CORS, Seguridad, Swagger, Beans de IA)
├── controller/       # Aquí llegan las peticiones HTTP (Solo llaman al servicio)
│   ├── AuthController.java
│   ├── DashboardController.java
│   └── TareaController.java
│
├── service/          # AQUÍ va la lógica de negocio (Cálculo de rangos, penalizaciones)
│   ├── impl/
│   ├── UsuarioService.java
│   └── GamificacionService.java
│
├── repository/       # Interfaces que extienden JpaRepository (SQL queries)
│   ├── UsuarioRepository.java
│   └── RangoRepository.java
│
├── model/            # Tus datos
│   ├── entity/       # Las clases que replican tus tablas SQL (JPA)
│   │   ├── Usuario.java
│   │   ├── Tarea.java
│   │   └── Rango.java
│   └── dto/          # Data Transfer Objects (Lo que envías al Frontend)
│       └── UsuarioDTO.java
│
└── exception/        # Manejo de errores global (para no enviar trazas feas al front)

```

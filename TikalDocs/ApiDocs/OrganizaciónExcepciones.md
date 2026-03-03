## Exceptions organization

```Plaintext
📁 exception
 ├── 📄 GlobalExceptionHandler.java (El controlador global se queda en la raíz)
 ├── 📄 ResourceAlreadyExistsException.java (Padre genérico, en la raíz)
 │
 ├── 📁 auth (Errores relacionados con seguridad/login/tokens)
 │    ├── 📄 InvalidTokenException.java
 │    └── 📄 UserNotAuthenticatedException.java
 │
 ├── 📁 user (Errores relacionados con la entidad usuario)
 │    ├── 📄 EmailAlreadyExistsException.java
 │    ├── 📄 NameAlreadyExistsException.java
 │    ├── 📄 NotFoundUserException.java
 │    └── 📄 InvalidUserPlanException.java
 │
 └── 📁 event (Cuando hagas lo del calendario en el futuro)
      ├── 📄 EventNotFoundException.java
      └── 📄 TimeSlotUnavailableException.java
```

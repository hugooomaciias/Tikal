<a id="top"></a>

<p align="center">
  <img src="frontend/public/logoDarkMode.svg" width="80" alt="Tikal">
</p>

<h1 align="center">Tikal</h1>

<p align="center">
  Sistema Inteligente de Gestión de Tiempo y Tareas con Gamificación basada en Cultura Maya
</p>

<p align="center">
  Trabajo de Fin de Grado Conjunto · Universidad de Málaga
</p>

---

## Descripción

**Tikal** es una plataforma orientada a la gestión de tareas, proyectos y tiempo de trabajo, diseñada para centralizar en una única aplicación la planificación, el seguimiento temporal, el análisis de la actividad, la colaboración y la asistencia mediante Inteligencia Artificial.

La plataforma permite organizar el trabajo mediante una estructura jerárquica de proyectos, fases, tareas y subtareas, registrar el tiempo dedicado a cada actividad y utilizar esta información para generar métricas, estadísticas y elementos de gamificación.

El sistema incorpora además funcionalidades de colaboración mediante equipos y mensajería en tiempo real, así como un asistente de Inteligencia Artificial capaz de utilizar información contextual del usuario para analizar su actividad y proporcionar recomendaciones.

## Trabajos de Fin de Grado

El desarrollo de Tikal se ha realizado de forma coordinada mediante dos Trabajos de Fin de Grado complementarios, desarrollados sobre una misma plataforma y con una separación clara de responsabilidades.

### Fernando Osuna Granados

**Título:**  
*Tikal: Sistema Inteligente de Gestión de Tiempo y Tareas con Gamificación basada en Cultura Maya*

**Subtítulo:**  
*Tikal backend y sistema de recomendaciones inteligente con Inteligencia Artificial*

**Ámbito de desarrollo:**
- Backend y lógica de negocio
- Base de datos y persistencia
- API REST
- Autenticación y autorización
- Sistemas de sincronización y optimización
- Integración con Inteligencia Artificial
- Gamificación y servicios asociados

La parte principal de este desarrollo se encuentra en la carpeta [`api/`](./api/).

### Hugo Macías Jiménez

**Título:**  
*Tikal: Sistema Inteligente de Gestión de Tiempo y Tareas con Gamificación basada en Cultura Maya*

**Subtítulo:**  
*Tikal frontend y sistema de experiencia de usuario adaptativa con Inteligencia Artificial*

**Ámbito de desarrollo:**
- Interfaz de usuario
- Experiencia de usuario
- Dashboard y visualización de información
- Integración con la API
- Gestión de las diferentes vistas y componentes del sistema

La parte principal de este desarrollo se encuentra en la carpeta [`frontend/`](./frontend/).

Ambos trabajos evolucionan de forma coordinada y forman conjuntamente la aplicación Tikal.

## Estructura del repositorio

```text
Tikal/
├── api/                # Backend y API de Tikal
├── frontend/           # Aplicación web y experiencia de usuario
├── TikalDocs/          # Documentación del proyecto
└── README.md           # Información general del proyecto
```

La carpeta [`TikalDocs/`](./TikalDocs/) contiene parte de la documentación generada durante el desarrollo del proyecto.

## Arquitectura

Tikal sigue una arquitectura modular en la que el frontend se comunica con el backend mediante una API REST. El backend centraliza la lógica de negocio y la persistencia de la información y proporciona, además, los servicios necesarios para la autenticación, colaboración, sincronización, gamificación e Inteligencia Artificial.

La comunicación en tiempo real se utiliza en determinadas funcionalidades de la plataforma, como el sistema de mensajería.

## Funcionalidades principales

* Gestión jerárquica de proyectos, fases, tareas y subtareas.
* Registro y seguimiento del tiempo dedicado a las actividades.
* Calendario y gestión de eventos.
* Estadísticas y métricas de productividad.
* Personalización de dashboards mediante widgets.
* Gestión de equipos, miembros y asignación de trabajo.
* Sistema de mensajería y comunicación en tiempo real.
* Gamificación mediante rangos y tótems inspirados en la cultura maya.
* Asistente de Inteligencia Artificial contextualizado con la información del usuario.
* Sincronización de la información necesaria para mantener el estado de trabajo entre diferentes sesiones y dispositivos.

## Documentación

La documentación adicional del proyecto se encuentra en [`TikalDocs/`](./TikalDocs/).

La documentación de la API se encuentra disponible mediante Swagger:

[**Tikal API Documentation**](https://astonishing-respect-production-7028.up.railway.app/swagger-ui/index.html)

## Tutorización

Proyecto desarrollado bajo la tutorización de:

**Rubén Saborido Infantes**

Universidad de Málaga.

## Estado del proyecto

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-%20TERMINADO-green" alt="Estado del proyecto">
</p>

## Equipo

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/fog-3">
        <img src="https://avatars.githubusercontent.com/u/147926495?s=400&u=c32592a471205ad1232e7f95aa0a8d687bb47b37&v=4" width="115"><br>
        <sub><b>Fernando Osuna Granados</b></sub>
      </a>
      <br>
      Backend · API · Base de datos · IA
    </td>
    <td align="center">
      <a href="https://github.com/hugooomaciias">
        <img src="https://avatars.githubusercontent.com/u/182810285?v=4" width="115"><br>
        <sub><b>Hugo Macías Jiménez</b></sub>
      </a>
      <br>
      Frontend · UX · Integración
    </td>
  </tr>
</table>

---

<p align="center">
  <a href="#top">⬆️ Volver arriba</a>
</p>

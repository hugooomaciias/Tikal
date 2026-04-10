# Tikal - User Settings & Configuration Documentation

This document explains the structure of the `user_settings` table in the Tikal database, focusing on how user preferences, dashboard layouts, and widget behaviors are stored.

## 1. Architecture Overview

The `user_settings` entity uses a hybrid approach to store configuration:

1. **Standard Relational Columns:** Used for settings that affect backend business logic, statistics calculations, or heavy SQL queries (e.g., `timezone`, `hours_goal`, `theme_setting`).
2. **JSON Columns (`JSON` Data Type):** Used for highly flexible, frontend-driven configurations. This prevents the database schema from requiring a new migration every time a new toggle or widget is added to the UI.

---

## 2. Standard Relational Columns

These fields are strictly typed in the database and mapped to Java Enums or basic types.

| Column Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| `theme_setting` | ENUM | `'MAYA'` | Global UI theme. Allowed values: `'CLARO'`, `'OSCURO'`, `'MAYA'`. |
| `time_range` | ENUM | `'SEMANAL'` | Default time range for global statistics. |
| `hours_goal` | INT | `40` | The user's weekly working hours goal. Used to calculate progress bars. |
| `focus_session_minutes` | INT | `25` | Default duration for the "Temple Mode" (Pomodoro) timer. |
| `timezone` | VARCHAR | `'Europe/Madrid'` | Critical for accurate time-tracking and daily gamification resets. |
| `first_day_of_week` | ENUM | `'LUNES'` | Determines when the weekly stats reset (`'LUNES'` or `'DOMINGO'`). |
| `show_rank_in_team` | BOOLEAN | `true` | Privacy toggle: whether to show the user's Maya Rank to teammates. |

---

## 3. JSON Metadata Structures

The following columns use the `JSON` data type. The backend treats them as standard Strings/Objects and passes them directly to the React frontend, which parses and applies them.

### 3.1 `layout_dashboards`

Stores the spatial arrangement of the widgets across the user's different screens (e.g., Home, Statistics, Team). It is designed to be highly flexible and compatible with grid libraries like `react-grid-layout`.

**Structure:** A JSON Object (dictionary) where each key represents a specific dashboard screen (String). The value for each key is an array of objects representing the grid coordinates for that specific screen.

For each object inside the array:
* `i`: Widget identifier (String).
* `x`: X-axis position (Integer).
* `y`: Y-axis position (Integer).
* `w`: Width in grid units (Integer).
* `h`: Height in grid units (Integer).

**Raw JSON Example in DB:**

```json
{
  "home": [
    {"i": "weekBarProgress", "x": 0, "y": 0, "w": 1, "h": 1},
    {"i": "timeTracker", "x": 1, "y": 0, "w": 1, "h": 1},
    {"i": "calendarEvents", "x": 1, "y": 1, "w": 2, "h": 1},
    {"i": "templeModeWidget", "x": 2, "y": 0, "w": 1, "h": 1},
    {"i": "taskWidget", "x": 3, "y": 0, "w": 1, "h": 2}
  ],
  "statistics": [
    {"i": "solarChart", "x": 0, "y": 0, "w": 1, "h": 2},
    {"i": "heatmap", "x": 1, "y": 1, "w": 1, "h": 1},
    {"i": "effectivenessChart", "x": 1, "y": 0, "w": 2, "h": 1},
    {"i": "comparisonWidget", "x": 2, "y": 1, "w": 1, "h": 1},
    {"i": "timeGoalWidget", "x": 3, "y": 0, "w": 1, "h": 1},
    {"i": "iaAdviceWidget", "x": 3, "y": 1, "w": 1, "h": 1},
  ],
  "team": [
    {"i": "teamRanking", "x": 0, "y": 0, "w": 4, "h": 8},
    {"i": "teamChat", "x": 4, "y": 0, "w": 8, "h": 8}
  ]
}

```

### 3.2 `widget_preferences`

Stores the internal configuration and filters for specific widgets. Instead of global settings, these dictate how individual components behave.

**Structure:** A root object where each key is a widget identifier (`i` from the layout), containing its specific settings.

**Raw JSON Example in DB:**

```json
{
  "solarChart": {
    "hiddenProjectIds": [3, 12],
    "defaultView": "MONTH",
    "showLegend": true
  },
  "taskList": {
    "sortBy": "URGENCY",
    "showCompleted": false,
    "compactMode": true
  },
  "calendar": {
    "hiddenCalendars": ["personal", "holidays"],
    "startHour": "08:00"
  }
}

```

*Note: If a new widget is created (e.g., "Team Ranking"), the frontend simply appends a new key `"teamRanking": {...}` to this JSON without requiring backend database changes.*

### 3.3 `notification_settings`

Handles user opt-ins for different types of alerts, reducing notification fatigue (especially in team environments).

**Structure:** A flat or slightly nested object with boolean flags.

**Raw JSON Example in DB:**

```json
{
  "email": {
    "weeklySummary": true,
    "teamInvites": true,
    "marketing": false
  },
  "inApp": {
    "chatMentions": true,
    "taskAssignments": true,
    "soundEnabled": false
  },
  "push": {
    "templeModeEnd": true
  }
}

```
---

## 4. Frontend & Backend Interaction Guide

1. **Initial Load:** When the React app boots, it fetches the user profile along with this entire settings object (`GET /api/users/me/settings`).
2. **Applying Settings:** * React uses `layout_dashboard` to render the grid.
* React passes the specific chunk of `widget_preferences` to each corresponding child component as props.


3. **Updating Settings:** * When a user changes a filter (e.g., hides a project in the Solar Chart), the frontend updates its local state.
* The frontend sends a `PATCH /api/users/me/settings` request with the updated JSON payload.
* **Important:** The backend should serialize/deserialize these fields using Jackson (Spring Boot handles this automatically with the `@JdbcTypeCode(SqlTypes.JSON)` annotation) and save the entire JSON tree back to the database.
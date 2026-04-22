Tienes toda la razón. Centralizar esta lógica en una clase de utilidades (Utils) es exactamente la decisión arquitectónica correcta. Evitas duplicar código (principio DRY: *Don't Repeat Yourself*) y te aseguras de que todos los widgets de tu Dashboard mantengan una coherencia visual perfecta.

Vamos a crear un método global que maneje los rangos de fechas de forma inteligente (omitiendo el mes si es el mismo) y que, además, acepte un parámetro booleano para decidir si quieres incluir el año o no. Así te servirá tanto para el `taskWidget` como para el `timeGoalWidget`.

### 1. La clase de Utilidades (`DateUtils`)

Si aún no tienes una carpeta/paquete `utils`, te recomiendo crearla y añadir esta clase:

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateUtils {

    private static final Locale SPANISH_LOCALE = new Locale("es", "ES");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM", SPANISH_LOCALE);
    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");

    /**
     * Formatea un rango de fechas. 
     * Ejemplos: "27 - 29 sep" | "30 sep - 6 oct" | "21 - 27 sep, 2026"
     */
    public static String formatDateRange(LocalDate startDate, LocalDate endDate, boolean includeYear) {
        String startMonth = startDate.format(MONTH_FORMATTER).replace(".", "").toLowerCase();
        String endMonth = endDate.format(MONTH_FORMATTER).replace(".", "").toLowerCase();
        
        String baseSubtitle;

        if (startDate.getMonth() == endDate.getMonth()) {
            // Caso: mismo mes -> "27 - 29 sep"
            baseSubtitle = String.format("%d - %d %s",
                    startDate.getDayOfMonth(),
                    endDate.getDayOfMonth(),
                    endMonth);
        } else {
            // Caso: distintos meses -> "30 sep - 6 oct"
            baseSubtitle = String.format("%d %s - %d %s",
                    startDate.getDayOfMonth(),
                    startMonth,
                    endDate.getDayOfMonth(),
                    endMonth);
        }

        if (includeYear) {
            String year = endDate.format(YEAR_FORMATTER);
            return baseSubtitle + ", " + year;
        }

        return baseSubtitle;
    }

    /**
     * Formatea un único día.
     * Ejemplo: "26 sep"
     */
    public static String formatSingleDate(LocalDate date) {
        String month = date.format(MONTH_FORMATTER).replace(".", "").toLowerCase();
        return String.format("%d %s", date.getDayOfMonth(), month);
    }
}
```

---

### 2. Actualización de `buildCardsByDeadline`

Ahora tu método del widget de tareas queda muchísimo más limpio, ya que delegas toda la lógica de los *Strings* a tu clase utilitaria y pones `includeYear` en `false`.

```java
    private List<TaskWidgetData.TaskCard> buildCardsByDeadline(
            List<Task> pendingTasks,
            Map<Integer, Integer> subtasksCountMap) {

        LocalDate today = LocalDate.now();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);
        LocalDateTime inThreeDays = endOfToday.plusDays(3);
        LocalDateTime inOneWeek = endOfToday.plusDays(10);

        // Usamos la nueva clase DateUtils (sin año para las tareas)
        String subtitleToday = DateUtils.formatSingleDate(today);
        String subtitleThreeDays = DateUtils.formatDateRange(today.plusDays(1), today.plusDays(3), false);
        String subtitleOneWeek = DateUtils.formatDateRange(today.plusDays(4), today.plusDays(10), false);

        List<TaskWidgetData.TaskItem> previousTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> todayTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> threeDaysTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> nextWeekTasks = new ArrayList<>();

        Integer previousTasksCompleted = 0;
        Integer todayTasksCompleted = 0;
        Integer threeDaysTasksCompleted = 0;
        Integer nextWeekTasksCompleted = 0;

        for (Task task : pendingTasks) {
            if (task.getDeadline() == null) continue;

            TaskWidgetData.TaskItem item = mapToTaskItem(task, subtasksCountMap);

            if (task.getDeadline().isBefore(endOfToday)){
                previousTasks.add(item);
                if (task.getIsCompleted()) {
                    previousTasksCompleted++;
                }
            } else if (task.getDeadline().isEqual(endOfToday)) {
                todayTasks.add(item);
                if (task.getIsCompleted()) {
                    todayTasksCompleted++;
                }
            } else if (task.getDeadline().isBefore(inThreeDays)) {
                threeDaysTasks.add(item);
                if (task.getIsCompleted()) {
                    threeDaysTasksCompleted++;
                }
            } else if (task.getDeadline().isBefore(inOneWeek)) {
                nextWeekTasks.add(item);
                if (task.getIsCompleted()) {
                    nextWeekTasksCompleted++;
                }
            }
        }

        return List.of(
                buildCard("Atrasadas", subtitleToday, previousTasks, previousTasksCompleted, previousTasks.size()),
                buildCard("Para hoy", subtitleToday, todayTasks, todayTasksCompleted, todayTasks.size()),
                buildCard("Próximos 3 días", subtitleThreeDays, threeDaysTasks, threeDaysTasksCompleted, threeDaysTasks.size()),
                buildCard("Próxima semana", subtitleOneWeek, nextWeekTasks, nextWeekTasksCompleted, nextWeekTasks.size())
        );
    }
```

### 3. (Extra) Actualización en tu `timeGoalWidget`

Para mantener la refactorización completa, cuando vayas a tu `timeGoalWidget`, puedes borrar toda esa lógica de formateo manual y simplemente llamar a:

```java
// Llamada con el parámetro en 'true' para que añada ", 2026"
String subtitle = DateUtils.formatDateRange(startDate, endDate, true);
```
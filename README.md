# Simulador de Conversión de Fecha/Hora (Front → ASO → APX → HOST)

Un simulador visual, interactivo y reactivo en tiempo real para visualizar, depurar y comprender las transformaciones de fechas y horas a lo largo de una arquitectura de software multicapa bancaria/empresarial.

---

## 📋 Descripción Funcional de la Aplicación

### 🎯 Propósito y Contexto
En arquitecturas distribuidas, la gestión de fechas y zonas horarias es una de las fuentes más frecuentes de errores (desfases de horas, pérdidas de datos, desfases por Horario de Verano/Invierno - DST, o formatos incompatibles). 

Esta aplicación simula de forma visual el viaje completo que realiza un dato de fecha y hora cuando un usuario interactúa con la aplicación desde su dispositivo cliente, atraviesa las capas intermedias de microservicios y arquitectura, se almacena en el sistema central (HOST Legacy), y regresa de vuelta a la pantalla del usuario.

---

## 🏛️ Las 4 Capas de la Arquitectura

La aplicación representa fielmente las 4 capas del sistema:

1. **Front-end (Dispositivo del Usuario)**:
   - **Ubicación/Zona**: Dispositivo del cliente (`Browser Local / Device Timezone`).
   - **Rol**: Punto de entrada de la fecha ingresada por el usuario y destino del resultado en la vuelta. Detecta automáticamente la zona horaria real del dispositivo del navegador.

2. **ASO (Capa de Microservicios)**:
   - **Ubicación/Zona**: Servidores en España (`Europe/Madrid`, UTC+1 en invierno / UTC+2 en verano).
   - **Rol**: Primera capa de backend encargada del orquestamiento de servicios y validaciones de negocio.

3. **APX (Capa de Arquitectura y Ejecución)**:
   - **Ubicación/Zona**: Servidores en España (`Europe/Madrid`, UTC+1 en invierno / UTC+2 en verano).
   - **Rol**: Capa intermedia de arquitectura que ejecuta la lógica transaccional antes de enviar los datos al sistema central. Por defecto, aplica transformaciones acordes al estándar de integración.

4. **HOST (Sistema Central / Base de Datos Legacy)**:
   - **Ubicación/Zona**: Servidor Legacy en Portugal (`Europe/Lisbon`, UTC+0 en invierno / UTC+1 en verano).
   - **Rol**: Sistema persistente central. **Regla de negocio crítica**: HOST almacena únicamente cadenas de fecha/hora en horario local de Portugal sin información explícita de huso horario (sin `Z` ni `+01:00`). Si se intenta guardar una cadena con offset o indicador de zona horaria, el simulador alerta de una violación de regla de HOST.

---

## 🔄 Flujo Bidireccional de Datos

El tablero de circuito (*Circuit Board*) muestra 7 columnas organizadas horizontalmente:

```
[ FRONT ] ──(Ida)──> [ ASO ] ──(Ida)──> [ APX ] ──(Ida)──> [ HOST (Guardado) ]
    │                                                            │
    └─────────<Vuelta)── [ ASO ] <──(Vuelta)── [ APX ] <──(Vuelta)────────┘
```

- **Canales de Conversión (Ida y Vuelta)**: Entre cada pareja de capas existen columnas interactivas donde el usuario puede arrastrar, reordenar, agregar o eliminar **Chips de Conversión**.
- **Evaluación Secuencial Pura**: Las transformaciones dentro de una columna se aplican en orden estricto de arriba a abajo. El resultado saliente de una capa se convierte en la entrada de la siguiente.

---

## ⚙️ Funcionalidades Clave

### 1. Gestión de Múltiples Tableros y Persistencia (Local / npoint.io)
- **Desplegable de Tableros**: Permite crear nuevos tableros (`+ NUEVO`), alternar entre ellos y guardarlos con nombres personalizados.
- **Sostenibilidad Dual**: Selector ovalado en el encabezado para guardar los tableros localmente (`localStorage`) o de forma remota en la nube mediante bins de `npoint.io`.
- **Modal de Seguridad PIN**: Confirmación de acciones críticas (guardado y eliminación) con código PIN predeterminado (`1234`).
- **Botones Unificados**: Botones de Guardar y Borrar agrupados sin separación interna en la barra superior.

### 2. Historial de Cambios (Undo / Redo)
- Soporte para deshacer y rehacer transformaciones de pasos de manera fluida a través de botones dedicados en el encabezado o mediante atajos de teclado (`Ctrl+Z`, `Ctrl+Y`, `Cmd+Shift+Z`).

### 3. Detección Automática de Zona Horaria del Dispositivo
Muestra en el encabezado y en el panel la zona horaria real del navegador cliente (vía `Intl.DateTimeFormat().resolvedOptions().timeZone`), adaptando dinámicamente las conversiones relativas al dispositivo.

### 4. Entrada de Prueba Libre
Permite ingresar cualquier cadena de fecha personalizada o seleccionar valores de prueba rápidamente desde la barra superior.

### 5. Catálogo Interactivo de Conversiones (Drag & Drop)
Un cajón lateral desplegable con más de 20 conversiones clasificadas en 4 categorías:
- 🌐 **Zona Horaria**: Conversiones explícitas entre UTC, España (`Europe/Madrid`), Portugal (`Europe/Lisbon`) y Dispositivo Local.
- 🕒 **Presencia de Hora**: Quitar componente de hora (date-only), forzar medianoche (`00:00:00`), truncado.
- 📄 **Formato & Timestamps**: Conversión a Timestamp Unix Epoch (ms), cadenas ISO 8601, string raw.
- 🖥️ **Formato de Capa**: Formato europeo (`DD/MM/YYYY HH:mm`), formato de base de datos (`YYYY-MM-DD HH:mm:ss`), eliminación de offsets.

Cada elemento del catálogo incluye una vista previa con tooltip flotante que muestra la descripción técnica y la implementación exacta de la función de transformación (`apply`).

### 6. Detección de Errores y Alertas de HOST (⚠️)
Si el valor resultante al llegar a la capa **HOST** contiene indicadores explícitos de zona horaria (`Z`, `UTC`, `GMT`, o diferencias como `+02:00`), el simulador resalta la tarjeta en rojo y muestra un mensaje de advertencia explicando que HOST no puede almacenar offsets.

### 7. Resumen Inferior y Validador de Resultados Esperados
Un panel inferior flotante que compara de un vistazo los tres hitos del flujo:
1. **Input Front**: Cadena original enviada.
2. **HOST**: Cadena efectivamente almacenada en la base de datos.
3. **Vuelta (Front)**: Cadena devuelta y renderizada en el cliente.

Incluye un botón de **Configurar** para ingresar los valores esperados de HOST y Vuelta, validando visualmente mediante contornos verdes (coincidencia exitosa) o rojos (desviación).

### 8. Modal de Equivalencias Horarias Internacionales
Permite comparar de forma simultánea e instantánea cómo se traduce la fecha de referencia en 6 regiones globales (España, Portugal, Hawaii, Kiribati, Isla Baker UTC-12 y Sydney), con indicadores de Horario de Verano (☀️ Verano / ❄️ Invierno) y botones para copiar o sincronizar la fecha actual.

---

## 💻 Apartado Técnico

### Stack Tecnológico
- **Librería de UI**: React 18 (Hooks, `useMemo`, `useState`).
- **Lenguaje**: TypeScript (tipado estricto sin `any`).
- **Build Tool**: Vite.
- **Estilos**: Tailwind CSS (clases de utilidad con paleta oscura elegante Slate/Indigo/Teal/Amber).
- **Iconografía**: `lucide-react`.

### Arquitectura de Código y Principios SOLID
- **S - Single Responsibility**: Cada componente realiza una única tarea visual o de interacción (`Header`, `CircuitBoard`, `SubColumnCard`, `HostColumnCard`, `SummaryPanel`, `CatalogDrawer`, `EquivalenciesModal`, `NewBoardModal`, `PinConfirmationModal`).
- **O - Open/Closed**: El catálogo de conversiones (`CONVERSION_CATALOG`) es fácilmente extensible añadiendo nuevos objetos `ConversionItem` sin modificar la lógica de renderizado del tablero.
- **L / I - Interface Segregation**: Tipos e interfaces globales consolidados en `src/types.ts`.
- **D - Dependency Inversion & Pure Functions**: Las transformaciones de fecha en `src/utils/timezone.ts` y las funciones `apply` de las conversiones son funciones puras sin efectos secundarios sobre el DOM ni el estado global.

### Parseo Seguro y Tolerancia a Fallos
El helper `parseFlexibleDate()` en `src/utils/timezone.ts` es capaz de interpretar múltiples formatos de entrada (ISO 8601, fecha sin hora, hora en espacio o T, timestamps epoch de 10 o 13 dígitos, y formatos europeos `DD/MM/YYYY`). En caso de recibir una cadena malformada, la canalización retorna el string sin lanzar excepciones para evitar cuelgues en la interfaz.

### Documentación de Mantenibilidad en la Raíz
- `PROJECT_ARCHITECTURE.md`: Mapa que vincula cada funcionalidad con su archivo exacto de código.
- `AGENTS.md`: Instrucciones y convenciones para asistentes de IA.
- `skills/conversions-management/SKILL.md`: Guía paso a paso para añadir, actualizar o eliminar conversiones del catálogo.

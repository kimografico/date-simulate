# Mapa Funcional y Arquitectura de la Aplicación

Este documento sirve como referencia rápida para cualquier Asistente o Agente IA que necesite entender o modificar el **Simulador de Conversión de Fecha/Hora**. Contiene el mapa de funcionalidades, los archivos involucrados y la ubicación exacta de los helpers y tipos.

---

## 🛠️ Visión General de la Aplicación

El proyecto es un simulador visual e interactivo de transformaciones de fechas a través de 4 capas clave de arquitectura de software:
1. **Front** (Dispositivo del cliente / Navegador, zona horaria dinámica del usuario).
2. **ASO** (Capa de microservicios en España, zona `Europe/Madrid`).
3. **APX** (Capa de ejecución de arquitectura en España, zona `Europe/Madrid`).
4. **HOST** (Base de datos / Servidor central, p. ej. Portugal `Europe/Lisbon` o UTC).

El flujo se divide en:
- **Ida**: Front → ASO → APX → HOST
- **Vuelta**: HOST → APX → ASO → Front

---

## 📂 Estructura de Archivos y Responsabilidades

| Archivo | Responsabilidad / Funcionalidad |
|---|---|
| `src/types.ts` | **Modelos y Tipos TypeScript**: Define `ConversionItem`, `LayerId`, `ColumnConfig`, `ColumnStep`, `CalculatedNode`, `PresetScenario`, `PipelinePreset`. |
| `src/data/conversions.ts` | **Catálogo de Conversiones y Capas**: Contiene las definiciones de las 4 capas (`LAYERS`) y el array `CONVERSION_CATALOG` con todas las transformaciones disponibles. |
| `src/utils/timezone.ts` | **Motor de Parseo e Interpretación de Fechas**: Contiene helpers como `parseFlexibleDate()`, `formatToTimezoneISO()`, `formatToTimezoneFormatted()`, `getTimezoneOffsetMinutes()`, y comprobación de horario de verano (`isDST()`). |
| `src/App.tsx` | **Estado Global y Layout Principal**: Mantiene la fecha inicial de prueba, el estado de las 6 columnas (`columns`), el modal de equivalencias y la zona horaria del dispositivo. |
| `src/components/Header.tsx` | **Encabezado**: Muestra la zona horaria del dispositivo (`Intl.DateTimeFormat().resolvedOptions().timeZone`), el input para la fecha de prueba, botón de catálogo y botón "Vaciar tablero". |
| `src/components/CircuitBoard.tsx` | **Tablero de Circuito**: Renderiza horizontalmente la secuencia de capas (Front, ASO, APX, HOST) y las columnas de conversión intermedias (Tanto en Ida como en Vuelta). |
| `src/components/ConversionColumn.tsx` | **Columna de Conversión**: Muestra las transformaciones aplicadas secuencialmente entre dos capas en una dirección (Ida o Vuelta). Permite reordenar o eliminar chips. |
| `src/components/LayerColumnCard.tsx` | **Tarjeta de Capa**: Renderiza el resultado acumulado en cada capa (valor procesado, UTC ref, indicador DST ☀️/❄️). |
| `src/components/LayerNodeCard.tsx` | **Nodo de Capa Individual**: Estilo de cada tarjeta de nodo dentro del circuito. |
| `src/components/SummaryPanel.tsx` | **Panel Inferior de Resumen**: Muestra la comparación del string en Front (Entrada), HOST (Guardado) y Front Vuelta (Resultado final), con badges de validación y botón de configuración de valores esperados. |
| `src/components/CatalogDrawer.tsx` | **Cajón de Catálogo**: Drawer lateral para explorar y añadir conversiones clasificadas por categoría (`timezone`, `time_presence`, `representation`, `formatting`) a cualquier columna. |
| `src/components/EquivalenciesModal.tsx` | **Modal de Equivalencias**: Muestra tabla explicativa de formatos y equivalencias de timezone. |

---

## 🎯 Mapa Rápido "Funcionalidad → Archivo"

Si necesitas modificar una parte específica del código, consulta esta tabla:

### 1. Añadir, modificar o eliminar una conversión de fecha
- **Tipos**: `src/types.ts` (`ConversionItem`, `ConversionCategory`)
- **Definición / Lógica de conversión**: `src/data/conversions.ts` (`CONVERSION_CATALOG`)
- **Skill dedicada**: Consultar `skills/conversions-management/SKILL.md`

### 2. Cambiar la lógica de parseo de fechas o cálculo UTC/DST
- **Helper**: `src/utils/timezone.ts` (`parseFlexibleDate`, `formatToTimezoneISO`, etc.)

### 3. Modificar el Header o los controles superiores
- **Componente**: `src/components/Header.tsx` (Zona horaria del dispositivo, input de fecha de prueba, catálogo, vaciar tablero)
- **Estado inicial**: `src/App.tsx` (`initialInputValue`)

### 4. Modificar el comportamiento por defecto del tablero (ej. conversión por defecto APX → HOST)
- **Estado inicial del tablero**: `src/App.tsx` (`useState` de `columns`, donde `ida_apx_host` tiene asignado `fmt_european`)

### 5. Ajustar el resumen inferior de entrada/guardado/vuelta
- **Componente**: `src/components/SummaryPanel.tsx`

### 6. Modificar visualmente las tarjetas de capa o las columnas del circuito
- **Componentes**: `src/components/CircuitBoard.tsx`, `src/components/ConversionColumn.tsx`, `src/components/LayerColumnCard.tsx`

---

## ⚡ Reglas para los Agentes e IA
1. **Verificar siempre `PROJECT_ARCHITECTURE.md`** antes de modificar código para saber exactamente a qué archivo dirigirse.
2. **Utilizar `skills/conversions-management/SKILL.md`** cuando la tarea involucre agregar, cambiar o eliminar elementos del catálogo de conversiones.

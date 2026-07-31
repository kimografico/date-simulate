---
name: conversions-management
description: Guía especializada para crear, editar, estructurar o eliminar conversiones de fecha y hora en el Simulador. Muestra la estructura de ConversionItem, helpers de parseo en timezone.ts y el catálogo en conversions.ts.
---

# Skill: Gestión de Conversiones de Fecha y Hora

Esta skill define la guía paso a paso y la estructura exacta necesaria para **añadir, modificar o eliminar conversiones** de fecha/hora en el catálogo del simulador.

---

## 📂 Archivos Involucrados

| Archivo | Contenido / Rol |
|---|---|
| `src/types.ts` | Contiene el tipo `ConversionItem` y el tipo union `ConversionCategory`. |
| `src/data/conversions.ts` | Exporta el array `CONVERSION_CATALOG: ConversionItem[]` con todas las conversiones disponibles. |
| `src/utils/timezone.ts` | Proporciona helpers de parseo y formateo (`parseFlexibleDate`, `formatToTimezoneISO`, `formatToTimezoneFormatted`, `getTimezoneOffsetMinutes`). |
| `src/App.tsx` | Contiene el estado inicial de las columnas del tablero (verificar si alguna conversión por defecto usa un `conversionId`). |

---

## 📐 Estructura de un `ConversionItem`

Cada conversión en `CONVERSION_CATALOG` implementa la siguiente interfaz:

```typescript
export type ConversionCategory = 
  | 'timezone'       // Cambios de huso horario (ej. UTC ➔ Europe/Madrid)
  | 'time_presence'  // Eliminación o adición de hora (ej. Quitar HH:mm:ss, Poner 00:00:00)
  | 'representation' // Cambios de representación interna (ej. Timestamp Unix, String raw)
  | 'formatting';    // Formateo visual (ej. DD/MM/YYYY HH:mm, ISO 8601)

export interface ConversionItem {
  id: string;          // Identificador único (ej. 'fmt_european', 'tz_utc_to_es')
  label: string;       // Título breve para el chip/botón (ej. 'ISO ➔ DD/MM/YYYY HH:mm')
  signature: string;   // Firma explicativa (ej. 'ISO 8601 ➔ Formato Europeo')
  category: ConversionCategory;
  description: string; // Explicación de la transformación que realiza
  apply: (input: string) => string; // Función pura de transformación
}
```

---

## 🛠️ Helpers Disponibles en `src/utils/timezone.ts`

Al implementar la función `apply(input: string)`, siempre se deben utilizar los helpers seguros para parsear la entrada:

1. **`parseFlexibleDate(input: string)`**:
   - Devuelve `{ date: Date | null, hasTime: boolean, hasTimezone: boolean }`.
   - Soporta ISO, YYYY-MM-DD, DD/MM/YYYY, HH:mm, Timestamps Unix, etc.
   - Si `date` es `null`, la función `apply` debe retornar `input` sin modificar para no romper la cadena.

2. **`formatToTimezoneISO(date: Date, timeZone: string)`**:
   - Formatea la fecha a string ISO con el offset exacto de la zona horaria especificada (ej. `'Europe/Madrid'`, `'Europe/Lisbon'`, `'UTC'`).

3. **`formatToTimezoneFormatted(date: Date, timeZone: string, formatStr: string)`**:
   - Formatea la fecha según un patrón (ej. `'DD/MM/YYYY HH:mm'`, `'YYYY-MM-DD'`).

---

## ➕ Paso a Paso: Crear una Nueva Conversión

1. Abrir `/src/data/conversions.ts`.
2. Crear un nuevo objeto que cumpla `ConversionItem`.
3. Añadirlo al array `CONVERSION_CATALOG`.

### Ejemplo: Añadir conversión a formato "DD-MM-YYYY HH:mm"
```typescript
{
  id: 'fmt_dash_european',
  label: 'ISO ➔ DD-MM-YYYY HH:mm',
  signature: 'ISO 8601 ➔ DD-MM-YYYY HH:mm',
  category: 'formatting',
  description: 'Convierte un string de fecha/hora ISO a formato europeo con guiones (DD-MM-YYYY HH:mm).',
  apply: (input: string) => {
    const parsed = parseFlexibleDate(input);
    if (!parsed.date) return input;
    return formatToTimezoneFormatted(parsed.date, 'Device', 'DD-MM-YYYY HH:mm');
  },
}
```

---

## 🗑️ Paso a Paso: Eliminar una Conversión

1. Abrir `/src/data/conversions.ts`.
2. Buscar el elemento por su `id` en `CONVERSION_CATALOG` y eliminarlo o comentarlo.
3. **Verificación importante**:
   - Comprobar `/src/App.tsx` para asegurarse de que el `id` eliminado no esté configurado como conversión por defecto en ninguna columna (por ejemplo, en `ida_apx_host`).
   - Si estaba en uso por defecto, reemplazar el `conversionId` por otro ID válido o dejar el array de pasos vacío (`steps: []`).
4. Ejecutar el linter y build (`lint_applet` / `compile_applet`) para asegurar que no existan referencias obsoletas.

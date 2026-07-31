# Instrucciones del Proyecto para Agentes e IA

Este proyecto es el **Simulador de Conversión de Fecha/Hora (Front → ASO → APX → HOST)**.

## 📌 Principio Fundamental
Antes de realizar cualquier modificación en el código o buscar archivos a ciegas, **DEBES consultar primero el documento de mapa funcional**:
👉 **[`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md)**

Allí encontrarás la relación exacta entre cada funcionalidad de la app y sus componentes, helpers y archivos de tipos.

---

## 🚀 Guías de Navegación Rápida
- **Tipos globales**: `/src/types.ts`
- **Catálogo de conversiones y capas**: `/src/data/conversions.ts`
- **Helpers de husos horarios y parseo de fechas**: `/src/utils/timezone.ts`
- **Componente principal de estado**: `/src/App.tsx`
- **Encabezado y controles**: `/src/components/Header.tsx`
- **Panel resumen inferior**: `/src/components/SummaryPanel.tsx`

---

## 🛠️ Skills Específicas
- **Gestión de Conversiones de Fecha/Hora**: Si la tarea solicita crear, actualizar, probar o eliminar una conversión de fecha/hora en el catálogo, lee la skill especializada en **[`skills/conversions-management/SKILL.md`](./skills/conversions-management/SKILL.md)**.

---

## ⚡ Convenciones del Código
1. **TypeScript**: Mantener tipos estrictos definidos en `src/types.ts`.
2. **Estilos**: Usar exclusivamente clases de Tailwind CSS.
3. **Parseo seguro**: Utilizar siempre los helpers de `src/utils/timezone.ts` (`parseFlexibleDate`) para evitar errores al procesar entradas malformadas o parciales.

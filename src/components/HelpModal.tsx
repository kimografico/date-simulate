import React from 'react';
import { X, HelpCircle, ArrowRightLeft, Globe, BookOpen, Save, Undo2, LayoutGrid, CheckCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Ayuda - Simulador de Conversión de Fecha/Hora</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Qué hace la app */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              Qué hace esta app
            </h3>
            <p>
              Simula el flujo de una fecha/hora a través de las capas de una arquitectura: <strong className="text-violet-300">Front</strong> → <strong className="text-teal-300">ASO</strong> → <strong className="text-sky-300">APX</strong> → <strong className="text-amber-300">HOST</strong>, y de vuelta. Permite ver cómo se transforma la fecha en cada paso y detectar errores de zona horaria o formato.
            </p>
          </section>

          {/* Conversiones */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Catálogo de Conversiones
            </h3>
            <p className="mb-1">
              El panel lateral derecho contiene un catálogo de conversiones arrastrables. Puedes:
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 text-slate-400">
              <li><strong className="text-slate-300">Arrastrar</strong> una conversión sobre una columna para añadirla al final de su cadena.</li>
              <li><strong className="text-slate-300">Hacer clic</strong> en una columna vacía para abrir el catálogo directamente.</li>
              <li><strong className="text-slate-300">Reordenar</strong> los pasos dentro de una columna con los botones de flecha o arrastrando.</li>
              <li><strong className="text-slate-300">Eliminar</strong> pasos individuales con el botón de papelera.</li>
            </ul>
          </section>

          {/* Equivalencias */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              Equivalencias
            </h3>
            <p>
              El botón <strong className="text-indigo-300">Equivalencias</strong> del header abre un modal que muestra la fecha/hora actual en diferentes zonas horarias (España, Portugal, etc.) para referencia rápida.
            </p>
          </section>

          {/* Guardado */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <Save className="w-4 h-4 text-amber-400" />
              Guardado (Local y Remoto)
            </h3>
            <p className="mb-1">
              Puedes guardar tableros con diferentes configuraciones de conversiones:
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 text-slate-400">
              <li><strong className="text-slate-300">Local</strong>: Guarda en el navegador (localStorage). Los datos no se comparten.</li>
              <li><strong className="text-slate-300">npoint.io</strong>: Guarda en la nube. Los datos se comparten con quien tenga el enlace.</li>
            </ul>
            <p className="mt-1">
              Cambia entre modos con el botón toggle del header. Puedes crear múltiples tableros con el botón <strong className="text-slate-300">+ NUEVO</strong>.
            </p>
          </section>

          {/* Footer */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-rose-400" />
              Validación en el Footer
            </h3>
            <p>
              El panel inferior muestra tres valores clave: la entrada original, el valor almacenado en HOST, y el resultado de vuelta a Front. Puedes configurar <strong className="text-indigo-300">valores esperados</strong> (botón de engranaje) para validar automáticamente: si el resultado coincide, el borde se marca en <span className="text-emerald-400 font-semibold">verde</span>; si no, en <span className="text-rose-400 font-semibold">rojo</span>. También detecta si HOST contiene zona horaria (error).
            </p>
          </section>

          {/* Deshacer / Rehacer */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <Undo2 className="w-4 h-4 text-slate-400" />
              Deshacer / Rehacer
            </h3>
            <p>
              Usa <strong className="text-slate-300">Ctrl+Z</strong> (Deshacer) o <strong className="text-slate-300">Ctrl+Y</strong> / <strong className="text-slate-300">Ctrl+Shift+Z</strong> (Rehacer), o los botones del header, para navegar por el historial de cambios del tablero activo.
            </p>
          </section>

          {/* Tableros */}
          <section>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-violet-400" />
              Gestión de Tableros
            </h3>
            <p>
              Cada tablero guarda su propia entrada, configuración de columnas y cadena de conversiones. Usa el selector del header para cambiar entre tableros, crear nuevos o eliminar los existentes.
            </p>
          </section>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

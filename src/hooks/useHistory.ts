import { useState, useCallback, useEffect } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((curr) => {
      const computedPresent =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(curr.present)
          : newPresent;

      // Avoid duplicate consecutive history entries
      if (JSON.stringify(computedPresent) === JSON.stringify(curr.present)) {
        return curr;
      }

      return {
        past: [...curr.past, curr.present],
        present: computedPresent,
        future: [],
      };
    });
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z for Undo, Ctrl+Y / Cmd+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isMod && isZ && e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      } else if (isMod && isZ && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          undo();
        }
      } else if (isMod && isY) {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

import { ref } from 'vue';
import type { CheckInPlugin } from '../composables/types';
import type { DeskCore } from '../composables/desk-core';

export interface HistoryEntry<T = unknown> {
  action: 'check-in' | 'check-out' | 'update';
  id: string | number;
  data?: T;
  timestamp: number;
}

export interface HistoryOptions {
  /** Maximum number of history entries to keep */
  maxHistory?: number;
}

/**
 * Plugin to track history of check-in/check-out/update operations.
 * Provides a reactive log of all desk operations with timestamps.
 *
 * @example
 * ```ts
 * const { desk } = createDesk(Symbol('items'), {
 *   plugins: [
 *     createHistoryPlugin({ maxHistory: 100 })
 *   ]
 * });
 *
 * // Get the full history
 * const history = desk.getHistory();
 *
 * // Get recent history
 * const recent = desk.getLastHistory(10);
 *
 * // Filter by action type
 * const checkIns = desk.getHistoryByAction('check-in');
 *
 * // Clear history
 * desk.clearHistory();
 * ```
 */
export const createHistoryPlugin = <T = unknown>(options?: HistoryOptions): CheckInPlugin<T> => {
  const maxHistory = options?.maxHistory || 50;

  return {
    name: 'history',
    version: '1.0.0',

    install: (desk: DeskCore<T>) => {
      const history = ref<HistoryEntry<T>[]>([]);

      // Add history to desk
      (desk as any).history = history;

      // Listen to events
      const unsubCheckIn = desk.on(
        'check-in',
        ({ id, data, timestamp }: { id?: string | number; data?: T; timestamp: number }) => {
          history.value.push({ action: 'check-in', id: id!, data: data as any, timestamp });
          if (history.value.length > maxHistory) {
            history.value.shift();
          }
        }
      );

      const unsubCheckOut = desk.on(
        'check-out',
        ({ id, timestamp }: { id?: string | number; data?: T; timestamp: number }) => {
          history.value.push({ action: 'check-out', id: id!, timestamp });
          if (history.value.length > maxHistory) {
            history.value.shift();
          }
        }
      );

      const unsubUpdate = desk.on(
        'update',
        ({ id, data, timestamp }: { id?: string | number; data?: T; timestamp: number }) => {
          history.value.push({ action: 'update', id: id!, data: data as any, timestamp });
          if (history.value.length > maxHistory) {
            history.value.shift();
          }
        }
      );

      // Cleanup
      return () => {
        unsubCheckIn();
        unsubCheckOut();
        unsubUpdate();
        history.value = [];
      };
    },

    methods: {
      /**
       * Get the history of operations
       */
      getHistory(desk: DeskCore<T>): HistoryEntry<T>[] {
        return (desk as any).history?.value || [];
      },

      /**
       * Clear the history
       */
      clearHistory(desk: DeskCore<T>) {
        const deskWithHistory = desk as any;
        if (deskWithHistory.history) {
          deskWithHistory.history.value = [];
        }
      },

      /**
       * Get last N history entries
       */
      getLastHistory(desk: DeskCore<T>, count: number): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.slice(-count);
      },

      /**
       * Get history filtered by action type
       */
      getHistoryByAction(
        desk: DeskCore<T>,
        action: 'check-in' | 'check-out' | 'update'
      ): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.filter((entry: HistoryEntry<T>) => entry.action === action);
      },
    },
  };
};

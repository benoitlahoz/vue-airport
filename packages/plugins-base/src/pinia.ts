import type { DeskCore, CheckInPlugin } from 'vue-airport';
import type { Store } from 'pinia';

export interface PiniaPluginHandler<T = unknown> {
  store: Store;
  onBeforeCheckIn?: (
    id: string | number,
    data: T,
    desk?: DeskCore<T>
  ) => Promise<boolean> | boolean;
  onCheckIn?: (id: string | number, data: T, desk?: DeskCore<T>) => Promise<void> | void;
  onBeforeCheckOut?: (id: string | number, desk?: DeskCore<T>) => Promise<boolean> | boolean;
  onCheckOut?: (id: string | number, desk?: DeskCore<T>) => Promise<void> | void;
  onBeforeUpdate?: (
    id: string | number,
    data: Partial<T>,
    desk?: DeskCore<T>
  ) => Promise<boolean> | boolean;
  onUpdate?: (id: string | number, data: Partial<T>, desk?: DeskCore<T>) => Promise<void> | void;
}

export interface PiniaPluginConfig<T = unknown> {
  handlers: PiniaPluginHandler<T>[];
}

/**
 * Plugin pour synchroniser le desk avec un ou plusieurs stores Pinia.
 * Les stores doivent exposer addItem et removeItem.
 *
 * @example
 * ```ts
 * import { useMyStore } from '@/stores/myStore';
 * const { desk } = createDesk(Symbol('members'), {
 *   plugins: [createPiniaPlugin({ handlers: [{ store: useMyStore() }] })]
 * });
 * ```
 */
export function createPiniaPlugin<T>(options: PiniaPluginConfig<T>): CheckInPlugin<T> {
  return {
    name: 'pinia',
    version: '1.0.0',

    install(desk: DeskCore<T>) {
      /*
      (desk as any).syncAllToStores = () => {
        options.handlers.forEach((store: PiniaSyncStoreConfig<T>) => {
          if (store.syncAllToStore) {
            store.syncAllToStore(desk);
          } else {
            desk.getAll().forEach((item: { data: T; id: string | number }) => {
              if (store.onCheckIn) {
                store.onCheckIn(item.id, item.data, desk);
              }
            });
          }
        });
      };

      (desk as any).clearAllFromStores = () => {
        options.handlers.forEach((store: PiniaSyncStoreConfig<T>) => {
          if (store.clearAllFromStore) {
            store.clearAllFromStore(desk);
          } else {
            desk.getAll().forEach((item: { id: string | number }) => {
              if (store.onCheckOut) {
                store.onCheckOut(item.id, desk);
              }
            });
          }
        });
      };
*/
      // Cleanup
      return () => {
        (desk as any).clearAllFromStores();
      };
    },

    async onBeforeCheckIn(id: string | number, data: T, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onBeforeCheckIn) {
          const result = await handler.onBeforeCheckIn(id, data, desk);
          if (result === false) {
            return false;
          }
        }
      }
      return true;
    },

    async onCheckIn(id: string | number, data: T, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onCheckIn) {
          await handler.onCheckIn(id, data, desk);
        }
      }
    },

    async onBeforeCheckOut(id: string | number, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onBeforeCheckOut) {
          const result = await handler.onBeforeCheckOut(id, desk);
          if (result === false) {
            return false;
          }
        }
      }
      return true;
    },

    async onCheckOut(id: string | number, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onCheckOut) {
          await handler.onCheckOut(id, desk);
        }
      }
    },

    async onBeforeUpdate(id: string | number, data: Partial<T>, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onBeforeUpdate) {
          const result = await handler.onBeforeUpdate(id, data, desk);
          if (result === false) {
            return false;
          }
        }
      }
      return true;
    },

    async onUpdate(id: string | number, data: Partial<T>, desk?: DeskCore<T>) {
      for (const handler of options.handlers) {
        if (handler.onUpdate) {
          await handler.onUpdate(id, data, desk);
        }
      }
    },
  };
}

import { type Ref, ref } from 'vue';
import type {
  CheckInPlugin,
  CheckInPluginComputed,
  CheckInPluginMethods,
  DeskCore,
} from 'vue-airport';

export interface ActiveItem<T = unknown> {
  id: string | number;
  data: T;
}

export type ActiveItemPluginExports<T> = ActiveItemPluginMethods<T> &
  ActiveItemPluginComputed &
  ActiveItemPluginRefs;

export interface ActiveItemPluginRefs {
  /**
   * Reactive reference to the active item's ID.
   * Null if no active item is set.
   */
  activeId: Ref<string | number | null>;
}

export interface ActiveItemPluginMethods<T> extends CheckInPluginMethods<T> {
  /**
   * Set the active item by ID.
   * @param id The item ID or null to clear.
   * @returns True if set/cleared, false if not found.
   */
  setActive(id: string | number | null): boolean;

  /**
   * Get the currently active item.
   * @returns The active item or null.
   */
  getActive(): ActiveItem<T> | null;

  /**
   * Clear the active item.
   * @returns True if cleared.
   */
  clearActive(): boolean;
}

export interface ActiveItemPluginComputed extends CheckInPluginComputed {
  /**
   * Check if there is an active item.
   * @returns True if an active item exists.
   */
  hasActive(): boolean;
}

/**
 * Interface for the ActiveItem plugin, extending CheckInPlugin.
 * Provides methods and computed properties for managing an active item in the desk.
 */
export interface ActiveItemPlugin<T>
  extends CheckInPlugin<T, ActiveItemPluginMethods<T>, ActiveItemPluginComputed>,
    ActiveItemPluginRefs {
  methods: ActiveItemPluginMethods<T>;
  computed: ActiveItemPluginComputed;
}

/**
 * Plugin to manage an active item in the desk.
 * Adds methods: setActive, getActive, clearActive
 * Adds computed: hasActive
 * Adds property: activeId
 * Emits event: 'active-changed'
 *
 * @example
 * ```ts
 * const { desk } = createDesk(Symbol('handlers'), {
 *   plugins: [createActiveItemPlugin()]
 * });
 *
 * desk.setActive('item-1');
 * const active = desk.getActive();
 * console.log(desk.hasActive); // true
 * ```
 */

export enum ActiveItemEvent {
  Changed = 'active:changed',
}

/**
 * Create an ActiveItem plugin for DeskCore.
 * Adds methods and computed properties to manage an active item.
 *
 * @returns {ActiveItemPlugin<T>} The plugin instance.
 */
export const createActiveItemPlugin = <T = unknown>(): ActiveItemPlugin<T> => {
  let deskInstance: DeskCore<T> | null = null;

  // Add reactive activeId state
  const activeId = ref<string | number | null>(null);

  return {
    name: 'active-item',
    version: '1.0.0',

    install: (desk: DeskCore<T>) => {
      deskInstance = desk;

      (desk as any).activeId = activeId;

      // Cleanup
      return () => {
        activeId.value = null;
        deskInstance = null;
      };
    },

    // Refs
    activeId,

    methods: {
      /**
       * Set the active item by ID
       */
      setActive(id: string | number | null) {
        const deskWithActive = deskInstance as any;

        const startTime = performance.now();
        const deskId = deskWithActive.__deskId;

        console.log('Will set active to:', id);

        if (id === null) {
          activeId.value = null;
          // Emit with undefined instead of null for type safety
          deskWithActive.emit(ActiveItemEvent.Changed as any, {
            id: undefined,
            data: undefined,
          });

          // Track in DevTools
          const duration = performance.now() - startTime;
          if (deskId) {
            deskWithActive.devTools.emit({
              type: 'plugin-execute',
              timestamp: Date.now(),
              deskId,
              pluginName: 'active-item',
              duration,
              data: { action: 'clearActive' },
            });
          }

          return false;
        }

        if (!deskWithActive.has(id)) return false;

        activeId.value = id;
        deskWithActive.emit(ActiveItemEvent.Changed as any, {
          id,
          data: deskWithActive.get(id)?.data,
        });

        // Track in DevTools
        const duration = performance.now() - startTime;
        if (deskId) {
          deskWithActive.devTools.emit({
            type: 'plugin-execute',
            timestamp: Date.now(),
            deskId,
            childId: id,
            pluginName: 'active-item',
            duration,
            data: { action: 'setActive' },
          });
        }

        return true;
      },

      /**
       * Get the currently active item
       */
      getActive() {
        const deskWithActive = deskInstance as any;
        const id = deskWithActive.activeId?.value;
        if (!id) return null;
        const item = deskWithActive.get(id);
        return item ?? null;
      },

      /**
       * Clear the active item
       */
      clearActive() {
        const deskWithActive = deskInstance as any;
        return deskWithActive.setActive?.(null);
      },
    },

    computed: {
      /**
       * Check if there's an active item
       */
      hasActive() {
        const deskWithActive = deskInstance as any;
        return deskWithActive.activeId?.value !== null;
      },
    },
  };
};

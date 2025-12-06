import { computed, type ComputedRef } from 'vue';
import type { CheckInPlugin, CheckInPluginMethods, DeskCore } from 'vue-airport';

export interface RegistryPluginMethods<T> extends CheckInPluginMethods<T> {
  // No methods, just the registry property
}

export interface RegistryPluginRefs<T> {
  registry: ComputedRef<T[]>;
}

export interface RegistryPlugin<T>
  extends CheckInPlugin<any, RegistryPluginMethods<T>>,
    RegistryPluginRefs<T> {
  methods: RegistryPluginMethods<T>;
}

export interface RegistryPluginOptions {
  /**
   * The 'type' property value to filter items by.
   * Items must have `data.type === type` to be included.
   */
  type: string;

  /**
   * Optional property name to aggregate from the item data.
   * If provided, the registry will contain `item.data[aggregationProp]` (flattened if array).
   * If not provided, the registry will contain the full `item.data`.
   */
  aggregationProp?: string;

  /**
   * Name of the property exposed on the desk.
   * Defaults to 'registry'.
   */
  name?: string;
}

/**
 * Plugin to aggregate items registered with a specific type.
 */
export const createRegistryPlugin = <T = any>(
  options: RegistryPluginOptions
): RegistryPlugin<T> => {
  const registryName = options.name || 'registry';

  let deskInstance: DeskCore<any> | null = null;

  const registry = computed(() => {
    if (!deskInstance) return [];
    // @ts-ignore - accessing internal items
    const items = deskInstance.items?.value || [];
    const filtered = items.filter((item: any) => item.data?.type === options.type);

    if (options.aggregationProp) {
      return filtered.flatMap((item: any) => {
        const prop = item.data[options.aggregationProp!];
        return Array.isArray(prop) ? prop : [prop];
      });
    }

    return filtered.map((item: any) => item.data);
  });

  return {
    name: `registry-${options.type}`,
    version: '1.0.0',
    install: (desk: DeskCore<any>) => {
      deskInstance = desk;

      // Expose on desk
      (desk as any)[registryName] = registry;

      return () => {
        deskInstance = null;
      };
    },
    methods: {},
    registry,
  };
};

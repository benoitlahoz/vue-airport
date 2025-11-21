import type { InjectionKey, Ref } from 'vue';
import type { CheckInItem, DeskCore } from '#vue-airport/composables/useCheckIn';

export interface PluginItemData {
  id: string;
  name: string;
  description: string;
}

// Extended type definition to include plugin methods
export interface DeskWithPlugins {
  activeId?: Ref<string | number | null>;
  getActive?: () => CheckInItem<PluginItemData> | null;
  getHistory?: () => Array<{ action: string; id: string | number; timestamp: number }>;
  setActive?: (id: string | number | null) => void;
}

export interface PluginItemContext {
  pluginItems: Ref<PluginItemData[]>;
}

export const PLUGIN_DESK_KEY: InjectionKey<DeskCore<PluginItemData> & PluginItemContext> =
  Symbol('pluginDesk');

export { default as MultiPlugin } from './MultiPlugin.vue';
export { default as PluginListItem } from './PluginListItem.vue';

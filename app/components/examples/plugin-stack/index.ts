import type { InjectionKey, Ref } from 'vue';
import type { DeskWithContext } from '#vue-airport';
import type { ActiveItemPluginExports } from '@vue-airport/plugins-base/activeItem';
import type { HistoryPluginExports } from '@vue-airport/plugins-base/history';

export interface PluginItemData {
  id: string;
  name: string;
  description: string;
}

export interface PluginItemContext {
  pluginItems: Ref<PluginItemData[]>;
  maxHistory: Ref<number>;
}

export type DeskWithPluginsStack = DeskWithContext<PluginItemData, PluginItemContext> &
  ActiveItemPluginExports<PluginItemData> &
  HistoryPluginExports<PluginItemData>;

export const PLUGIN_DESK_KEY: InjectionKey<Ref<PluginItemData> & PluginItemContext> =
  Symbol('pluginDesk');

export { default as PluginStack } from './PluginStack.vue';
export { default as PluginStackListItem } from './PluginStackListItem.vue';
export { default as PluginStackActiveItemPanel } from './PluginStackActiveItemPanel.vue';
export { default as PluginStackHistoryPanel } from './PluginStackHistoryPanel.vue';

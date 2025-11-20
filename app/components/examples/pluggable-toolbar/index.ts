import type { InjectionKey } from 'vue';
import type { DeskCore } from '#vue-airport';

export interface ToolItemData {
  id: string;
  label: string;
  icon: string;
}

export interface SlotsToolbarContext {
  toolItems: Ref<ToolItemData[]>;
  zones: string[];
}

export const SLOTS_TOOLBAR_DESK_KEY: InjectionKey<DeskCore<ToolItemData> & SlotsToolbarContext> =
  Symbol('slotsToolbarDesk');

export { default as Toolbar } from './Toolbar.vue';
export { default as PluggableToolbar } from './PluggableToolbar.vue';
export { default as PluggableToolItem } from './PluggableToolItem.vue';
export { default as SaveToolItem } from './SaveToolItem.vue';

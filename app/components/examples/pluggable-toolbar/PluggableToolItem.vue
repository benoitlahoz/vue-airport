<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { cn } from '@/lib/utils';
import { type ToolItemData, SLOTS_TOOLBAR_DESK_KEY, type SlotsToolbarContext } from '.';

export interface PluggableToolItemProps {
  id: string;
  label?: string;
  icon?: string;
  zone?: string;
  class?: HTMLAttributes['class'];
}

const props = defineProps<PluggableToolItemProps>();

// Check in to the desk with watchData
const { checkIn } = useCheckIn<ToolItemData, SlotsToolbarContext>();
const { desk } = checkIn(SLOTS_TOOLBAR_DESK_KEY, {
  id: props.id,
  autoCheckIn: true,
  watchData: true,
  data: () => ({
    id: props.id,
    label: props.label || '',
    icon: props.icon || '',
  }),
});

// Get tool item data from context
const toolItemData = computed(() => {
  return desk?.toolItems?.value.find((item) => item.id === props.id);
});
</script>

<template>
  <div data-slot="pluggable-tool-item" :class="cn('aspect-square', props.class)">
    <slot :desk="desk" :data="toolItemData" />
  </div>
</template>

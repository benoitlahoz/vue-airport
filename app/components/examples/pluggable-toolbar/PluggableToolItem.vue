<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { cn } from '@/lib/utils';
import {
  type ToolItemData,
  SLOTS_TOOLBAR_DESK_KEY,
  type SlotsToolbarContext,
  type DeskWithActive,
} from '.';

export type PluggableToolItemType = 'push' | 'toggle';

export interface PluggableToolItemProps {
  id: string;
  gate?: string;
  type?: PluggableToolItemType;
}

const props = withDefaults(defineProps<PluggableToolItemProps>(), {
  type: 'push',
  gate: undefined,
});

// Check in to the desk
const { checkIn } = useCheckIn<ToolItemData, SlotsToolbarContext>();
const { desk } = checkIn(SLOTS_TOOLBAR_DESK_KEY, {
  id: props.id,
  autoCheckIn: true,
  watchData: true,
  watchCondition: (desk) => {
    if (!props.gate) return true;
    if (!desk) return false;
    return desk.gates.includes(props.gate);
  },
});

function onAction() {
  if (props.type === 'toggle') {
    const d = desk as DeskWithActive;
    if (d?.setActive) {
      d.setActive(d.activeId?.value === props.id ? null : props.id);
    }
  } else {
    // push: émettre un événement ou callback (à adapter selon besoin)
    // Ici, on peut émettre un event natif ou custom
    // e.g. emit('action') si defineEmits est utilisé
  }
}

// Compute container class
const containerClass = computed(() =>
  cn('flex items-center justify-center overflow-hidden', desk?.itemClass.value)
);

defineOptions({
  __isToolbarItem: true,
});
</script>

<template>
  <div data-slot="pluggable-tool-item" :class="containerClass">
    <slot :desk="desk" :classes="desk?.itemClass.value" :on-action="onAction" />
  </div>
</template>

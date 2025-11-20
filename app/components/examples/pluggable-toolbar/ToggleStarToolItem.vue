<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

import type { DeskWithActive } from '.';

export interface ToggleStarToolItemProps {
  gate?: string;
  label?: string;
  icon?: string;
}

const props = withDefaults(defineProps<ToggleStarToolItemProps>(), {
  gate: 'center',
  label: 'Toggle Star',
  icon: 'material-symbols:star',
});

const toolId = 'toggle-star';

function deskWithActive(desk: unknown): DeskWithActive | undefined {
  if (desk && typeof desk === 'object' && 'setActive' in desk && 'activeId' in desk) {
    return desk as DeskWithActive;
  }
  return undefined;
}

const handleToggle = (desk: DeskWithActive | undefined) => {
  if (!desk?.setActive) return;
  desk.setActive(desk.activeId?.value === toolId ? null : toolId);
};
</script>

<template>
  <PluggableToolItem
    :id="toolId"
    :gate="props.gate"
    :label="props.label"
    :icon="props.icon"
    :watch-data="['activeId']"
  >
    <template #default="{ desk, classes }">
      <Button
        :class="[classes, deskWithActive(desk)?.activeId?.value === toolId ? 'bg-yellow-200' : '']"
        :aria-pressed="deskWithActive(desk)?.activeId?.value === toolId"
        tabindex="0"
        role="button"
        @click="handleToggle(deskWithActive(desk))"
        @keydown.enter.space="handleToggle(deskWithActive(desk))"
      >
        <span v-if="deskWithActive(desk)?.activeId?.value === toolId">&#11088; Actif</span>
        <span v-else>&#9734; Inactif</span>
      </Button>
    </template>
  </PluggableToolItem>
</template>

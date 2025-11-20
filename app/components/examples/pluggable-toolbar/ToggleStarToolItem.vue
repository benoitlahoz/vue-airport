<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

export interface ToggleStarToolItemProps {
  gate?: string;
}

const props = withDefaults(defineProps<ToggleStarToolItemProps>(), {
  gate: 'center',
});

const toolId = 'toggle-star';
</script>

<template>
  <PluggableToolItem :id="toolId" :gate="props.gate" :type="'toggle'">
    <template #default="{ desk, classes, onAction }">
      <Button
        :class="[classes, (desk as any)?.activeId?.value === toolId ? 'bg-yellow-200' : '']"
        :aria-pressed="(desk as any)?.activeId?.value === toolId"
        tabindex="0"
        role="button"
        @click="onAction"
        @keydown.enter.space="onAction"
      >
        <span v-if="(desk as any)?.activeId?.value === toolId">&#11088; Actif</span>
        <span v-else>&#9734; Inactif</span>
      </Button>
    </template>
  </PluggableToolItem>
</template>

<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

export interface LoadToolItemProps {
  gate?: string;
}

const props = withDefaults(defineProps<LoadToolItemProps>(), {
  gate: 'left',
});

const toolId = 'load';

const handleLoad = () => {
  console.log('Load action triggered');
  // Logique de chargement ici
};
</script>

<template>
  <PluggableToolItem
    :id="toolId"
    :gate="props.gate"
    :data="() => ({ id: toolId, gate: props.gate })"
    :watch-data="true"
  >
    <Button variant="outline" size="sm" class="w-full h-full p-0" @click="handleLoad">
      <UIcon name="material-symbols:download" />
    </Button>
  </PluggableToolItem>
</template>

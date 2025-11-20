<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

export interface LoadToolItemProps {
  gate?: string;
  label?: string;
  icon?: string;
}

const props = withDefaults(defineProps<LoadToolItemProps>(), {
  gate: 'left',
  label: 'Load',
  icon: 'material-symbols:download',
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
    :data="() => ({ id: toolId, label: props.label, icon: props.icon, gate: props.gate })"
    :watch-data="true"
  >
    <Button variant="outline" size="sm" class="w-full h-full p-0" @click="handleLoad">
      <UIcon :name="props.icon" />
    </Button>
  </PluggableToolItem>
</template>

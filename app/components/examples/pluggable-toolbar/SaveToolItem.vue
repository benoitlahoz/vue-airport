<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

export interface SaveToolItemProps {
  gate?: string;
}

const props = withDefaults(defineProps<SaveToolItemProps>(), {
  gate: 'left',
});

const toolId = 'save';

const handleSave = () => {
  console.log('Save action triggered');
  // Logique de sauvegarde ici
};
</script>

<template>
  <PluggableToolItem
    :id="toolId"
    :gate="props.gate"
    :data="() => ({ id: toolId, gate: props.gate })"
    :watch-data="true"
  >
    <Button variant="outline" size="sm" class="w-full h-full p-0" @click="handleSave">
      <UIcon name="material-symbols:save" />
    </Button>
  </PluggableToolItem>
</template>

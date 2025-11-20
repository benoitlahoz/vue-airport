<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

export interface SaveToolItemProps {
  gate?: string;
  label?: string;
  icon?: string;
}

const props = withDefaults(defineProps<SaveToolItemProps>(), {
  gate: 'left',
  label: 'Save',
  icon: 'material-symbols:save',
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
    :data="() => ({ id: toolId, label: props.label, icon: props.icon, gate: props.gate })"
    :watch-data="true"
  >
    <Button variant="outline" size="sm" class="w-full h-full p-0" @click="handleSave">
      <UIcon :name="props.icon" />
    </Button>
  </PluggableToolItem>
</template>

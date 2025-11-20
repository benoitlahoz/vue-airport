<script setup lang="ts">
import { PluggableToolItem } from '.';
import { Button } from '@/components/ui/button';

/**
 * Save Tool Item
 *
 * Exemple de composant toolbar qui encapsule PluggableToolItem
 * et définit sa propre zone et son id
 */

const handleSave = () => {
  console.log('Save action triggered');
  // Logique de sauvegarde ici
};
</script>

<template>
  <PluggableToolItem id="save" label="Save" icon="💾" zone="right">
    <template #default="{ data }">
      <Button size="sm" @click="handleSave"> {{ data?.icon }} {{ data?.label }} </Button>
    </template>
  </PluggableToolItem>
</template>

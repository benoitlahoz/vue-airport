<script setup lang="ts">
import { cn } from '@/lib/utils';
import {
  PluggableToolbar,
  PluggableToolbarGate,
  PluggableToolItem,
  LoadToolItem,
  SaveToolItem,
} from '.';
</script>

<template>
  <div class="w-full h-12 border border-border rounded-md overflow-hidden p-2">
    <PluggableToolbar
      class="flex h-full min-h-full gap-0"
      item-class="aspect-square max-h-full h-full overflow-hidden rounded-md select-none"
    >
      <!-- Define gates with their layout -->
      <PluggableToolbarGate name="left" class="flex flex-1 justify-start min-w-0 gap-2" />
      <PluggableToolbarGate name="center" class="flex flex-1 justify-center gap-2" />
      <PluggableToolbarGate name="right" class="flex flex-1 justify-end min-w-0 gap-2" />

      <!-- Items that register in gates -->
      <LoadToolItem gate="left" />
      <SaveToolItem gate="center" />

      <!-- Insert tools inline, inherit from the global configuration with `classes` -->
      <PluggableToolItem id="center-item" v-slot="{ classes }" gate="center">
        <div
          :class="
            cn(
              'flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium',
              classes
            )
          "
        >
          ⭐
        </div>
      </PluggableToolItem>

      <!-- Toggle actif via composant dédié -->
      <ToggleStarToolItem gate="center" />

      <!-- Should not be rendered because gate is not allowed -->
      <PluggableToolItem id="non-gate-item" gate="non-gate">
        <div>Not bound to gate</div>
      </PluggableToolItem>

      <!-- Should not be rendered because gate is undefined -->
      <PluggableToolItem id="non-gate-item">
        <div>Undefined gate</div>
      </PluggableToolItem>

      <!-- Should not be rendered because not a PluggableToolItem -->
      <div>Not a PluggableToolItem</div>
    </PluggableToolbar>
  </div>
</template>

<style scoped></style>

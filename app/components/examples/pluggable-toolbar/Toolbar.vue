<script setup lang="ts">
import { PluggableToolbar, SaveToolItem } from '.';
</script>

<template>
  <div class="w-full border border-border rounded-md bg-muted">
    <PluggableToolbar :zones="['left', 'center', 'right']">
      <SaveToolItem />
    </PluggableToolbar>
  </div>
</template>

<style scoped></style>

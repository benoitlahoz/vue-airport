<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  component: Component;
}>();
</script>

<template>
  <div class="p-4 border border-primary rounded bg-elevated shadow-lg">
    <component :is="component" />
  </div>
</template>

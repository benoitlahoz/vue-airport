<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  component: Component;
}>();
</script>

<template>
  <div class="h-4" />
  <div class="py-4 px-2 md:px-6 bg-card rounded-lg">
    <component :is="component" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  formattedValue?: string;
  type?: string;
  asChild?: boolean;
}

defineProps<Props>();
</script>

<template>
  <!-- Si as-child, on render le slot -->
  <slot v-if="asChild" />

  <!-- Sinon, on render le composant par défaut -->
  <span v-else class="ml-2 text-muted-foreground">
    {{ formattedValue }}
  </span>
</template>

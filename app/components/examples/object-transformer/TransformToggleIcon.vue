<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

interface Props {
  isOpen?: boolean;
  asChild?: boolean;
}

defineProps<Props>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <!-- Si as-child, on render le slot -->
  <slot v-if="asChild" />

  <!-- Sinon, on render le composant par défaut -->
  <ChevronRight
    v-else
    class="w-3 h-3 text-muted-foreground cursor-pointer shrink-0 transition-transform"
    :class="{ 'rotate-90': isOpen }"
    @click="$emit('click')"
  />
</template>

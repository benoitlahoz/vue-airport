<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Undo, Trash } from 'lucide-vue-next';
import type { ObjectNode } from './index';

interface Props {
  node: ObjectNode;
  isVisible: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <div
    class="overflow-hidden transition-all duration-200"
    :class="isVisible ? 'w-4 mr-1.5' : 'w-0'"
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-4 w-4 p-0 shrink-0"
      :title="node.deleted ? 'Restore property' : 'Delete property'"
      @click.stop="emit('toggle')"
    >
      <Undo v-if="node.deleted" class="w-3.5 h-3.5 text-muted-foreground" />
      <Trash v-else class="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
    </Button>
  </div>
</template>

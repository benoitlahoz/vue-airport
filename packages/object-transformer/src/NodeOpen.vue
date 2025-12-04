<script setup lang="ts">
import { computed } from 'vue';
import { useCheckIn } from 'vue-airport';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import type { ObjectNodeData, ObjectTransformerContext } from '.';
import { ObjectTransformerDeskKey } from '.';

interface Props {
  nodeId: string;
}

const props = defineProps<Props>();

const { checkIn } = useCheckIn<ObjectNodeData, ObjectTransformerContext>();
const { desk } = checkIn(ObjectTransformerDeskKey);

if (!desk) {
  throw new Error('ObjectTransformer desk not found');
}

const node = computed(() => desk.getNode(props.nodeId));

const isOpen = computed({
  get: () => node.value?.isOpen ?? true,
  set: (value) => {
    if (node.value) {
      node.value.isOpen = value;
    }
  },
});

const hasChildren = computed(() => (node.value?.children?.length ?? 0) > 0);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div v-if="hasChildren" data-slot="node-open">
    <ChevronRight v-if="!isOpen" class="node-open-icon" @click="toggleOpen" />
    <ChevronDown v-else-if="isOpen" class="node-open-icon" @click="toggleOpen" />
  </div>
</template>

<style>
/* NodeOpen styles - using ObjectNode variables */
.node-open-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--object-node-muted-foreground);
  cursor: pointer;
  flex-shrink: 0;
  transition-property: color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.node-open-icon:hover {
  color: var(--object-node-primary);
}
</style>

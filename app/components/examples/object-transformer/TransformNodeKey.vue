<script setup lang="ts">
import { Input } from '@/components/ui/input';
import type { ObjectNode } from '.';

interface Props {
  node: ObjectNode;
  isEditing: boolean;
  tempKey: string | null;
  keyClasses: string;
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
  'update:tempKey': [value: string];
  confirm: [];
  cancel: [];
}>();

const inputRef = defineModel<InstanceType<typeof Input> | null>('inputRef');
</script>

<template>
  <div class="cursor-pointer flex items-center gap-2" @click="!isEditing && emit('click')">
    <Input
      v-if="isEditing"
      ref="inputRef"
      :model-value="tempKey || ''"
      class="h-6 px-2 py-0 text-xs"
      autofocus
      @update:model-value="(val) => emit('update:tempKey', String(val))"
      @keyup.enter="emit('confirm')"
      @keyup.esc="emit('cancel')"
      @click.stop
    />
    <span v-else :class="keyClasses">{{ node.key }}</span>
  </div>
</template>

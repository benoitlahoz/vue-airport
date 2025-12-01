<script setup lang="ts">
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import type { Transform } from './index';

interface Props {
  modelValue: string | null;
  transforms: Transform[];
  placeholder?: string;
  showRemove?: boolean;
  removeLabel?: string;
  asChild?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: '+',
  showRemove: true,
  removeLabel: 'Remove all',
});

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
}>();
</script>

<template>
  <!-- Si as-child, on render le slot -->
  <slot v-if="asChild" />

  <!-- Sinon, on render le composant par défaut -->
  <Select v-else :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger
      class="h-auto max-h-6 px-2 py-0.5 text-xs group-hover:border-primary min-w-[120px]"
    >
      <SelectValue :placeholder="placeholder" class="text-xs">
        {{ modelValue || placeholder }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="text-xs">
      <SelectGroup>
        <SelectLabel>Transformations</SelectLabel>
        <SelectItem v-if="showRemove" value="None" class="text-xs">
          {{ removeLabel }}
        </SelectItem>
        <SelectItem v-for="tr in transforms" :key="tr.name" :value="tr.name" class="text-xs">
          {{ tr.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

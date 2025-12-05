<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';

const props = defineProps<{
  desk: any; // Desk with context
}>();

const conditionsByType = computed(() => {
  const conditions = props.desk?.conditions?.value || [];
  const grouped: Record<string, any[]> = {};

  conditions.forEach((condition: any) => {
    const types = condition.applicableTo || ['all'];
    types.forEach((type: string) => {
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(condition);
    });
  });

  return grouped;
});

const totalConditions = computed(() => props.desk?.conditions?.value?.length || 0);
</script>

<template>
  <div v-if="totalConditions > 0" class="border rounded-lg p-2.5 bg-card space-y-1.5">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold">🔍 Conditions</span>
        <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
          {{ totalConditions }}
        </Badge>
      </div>
      <div class="flex flex-wrap gap-1 justify-end">
        <Badge
          v-for="(conditions, type) in conditionsByType"
          :key="type"
          variant="outline"
          class="text-[10px] px-1.5 py-0"
        >
          <span class="font-mono">{{ type }}</span
          >:{{ conditions.length }}
        </Badge>
      </div>
    </div>
  </div>
</template>

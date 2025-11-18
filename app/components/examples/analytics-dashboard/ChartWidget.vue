<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { DASHBOARD_DESK_KEY, type MetricWidget } from '.';

interface Props {
  id: string;
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  chartType?: 'bar' | 'donut';
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  chartType: 'bar',
  isActive: false,
});

const emit = defineEmits<{
  select: [id: string];
}>();

// Check in to the dashboard desk
const { checkIn } = useCheckIn<MetricWidget>();

// Register widget with auto check-in and watch data
checkIn(DASHBOARD_DESK_KEY, {
  id: props.id,
  autoCheckIn: true,
  watchData: true,
  data: () => ({
    id: props.id,
    type: 'chart',
    title: props.title,
    data: props.data,
    color: props.color,
  }),
});

// Handle selection
const handleClick = () => {
  emit('select', props.id);
};

// Chart calculations
const maxValue = computed(() => Math.max(...props.data.map((d) => d.value)));
const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0));

// Color classes
const colorClasses = {
  green: 'text-green-500',
  blue: 'text-blue-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  purple: 'text-purple-500',
};
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900 min-h-[320px]"
    :class="[
      isActive
        ? 'border-current shadow-lg scale-[1.02]'
        : 'border-gray-200 dark:border-gray-700 hover:border-current hover:shadow-md hover:-translate-y-1',
      colorClasses[color],
    ]"
    @click="handleClick"
  >
    <!-- Colored accent -->
    <div
      class="absolute top-0 left-0 h-full w-1 transition-all duration-300"
      :class="[isActive ? 'w-full opacity-10' : 'w-1', `bg-${color}-500`]"
    />

    <div class="relative p-5">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <UBadge
          :color="color === 'green' ? 'success' : color === 'blue' ? 'primary' : 'secondary'"
          variant="subtle"
        >
          {{ chartType }}
        </UBadge>
      </div>

      <!-- Bar Chart -->
      <div v-if="chartType === 'bar'" class="space-y-3">
        <div
          v-for="item in data"
          :key="item.label"
          class="grid grid-cols-[3rem_1fr_4rem] items-center gap-3"
        >
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{
            item.label
          }}</span>
          <div class="h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="`bg-${color}-500`"
              :style="{ width: `${(item.value / maxValue) * 100}%` }"
            />
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-white text-right">
            {{ item.value.toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- Donut Chart -->
      <div v-else class="grid grid-cols-[1fr_160px] gap-6 items-center">
        <div class="space-y-3">
          <div
            v-for="(item, index) in data"
            :key="item.label"
            class="grid grid-cols-[1rem_1fr_auto] items-center gap-2"
          >
            <div class="w-4 h-4 rounded" :class="`bg-${color}-${500 - index * 100}`" />
            <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{
              item.label
            }}</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ item.value }}%</span>
          </div>
        </div>
        <div class="relative w-40 h-40">
          <svg viewBox="0 0 100 100" class="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              stroke-width="20"
              class="text-gray-200 dark:text-gray-700"
            />
            <circle
              v-for="(item, index) in data"
              :key="`arc-${item.label}`"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              :class="`text-${color}-${500 - index * 100}`"
              stroke-width="20"
              :stroke-dasharray="`${(item.value / total) * 251.2} 251.2`"
              :stroke-dashoffset="
                251.2 - data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 251.2, 0)
              "
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ total }}%</span>
            <span class="text-xs text-gray-500 uppercase tracking-wide">Total</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Safelist for dynamic Tailwind classes */
.bg-green-500 {
  background-color: rgb(34 197 94);
}
.bg-blue-500 {
  background-color: rgb(59 130 246);
}
.bg-orange-500 {
  background-color: rgb(249 115 22);
}
.bg-red-500 {
  background-color: rgb(239 68 68);
}
.bg-purple-500 {
  background-color: rgb(168 85 247);
}

.bg-green-400 {
  background-color: rgb(74 222 128);
}
.bg-blue-400 {
  background-color: rgb(96 165 250);
}
.bg-purple-400 {
  background-color: rgb(192 132 252);
}

.text-green-500 {
  color: rgb(34 197 94);
}
.text-blue-500 {
  color: rgb(59 130 246);
}
.text-purple-500 {
  color: rgb(168 85 247);
}
</style>

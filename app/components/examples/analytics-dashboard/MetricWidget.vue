<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { DASHBOARD_DESK_KEY, type MetricWidget } from '.';

interface Props {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  icon?: string;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  previousValue: 0,
  unit: '',
  color: 'blue',
  icon: 'i-lucide-activity',
  isActive: false,
});

const emit = defineEmits<{
  select: [id: string];
}>();

// Check in to the dashboard desk
const { checkIn } = useCheckIn<MetricWidget>();

// Compute trend
const trend = computed(() => {
  if (!props.previousValue) return 'stable';
  return props.value > props.previousValue
    ? 'up'
    : props.value < props.previousValue
      ? 'down'
      : 'stable';
});

const trendPercentage = computed(() => {
  if (!props.previousValue || props.previousValue === 0) return 0;
  return ((props.value - props.previousValue) / props.previousValue) * 100;
});

// Register widget with auto check-in and watch data
checkIn(DASHBOARD_DESK_KEY, {
  id: props.id,
  autoCheckIn: true,
  watchData: true,
  data: () => ({
    id: props.id,
    type: 'metric',
    title: props.title,
    value: props.value,
    previousValue: props.previousValue,
    unit: props.unit,
    trend: trend.value,
    color: props.color,
    icon: props.icon,
  }),
});

// Handle selection
const handleClick = () => {
  emit('select', props.id);
};

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
    class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer"
    :class="[
      isActive
        ? 'border-current shadow-lg scale-[1.02]'
        : 'border-gray-200 dark:border-gray-700 hover:border-current hover:shadow-md hover:-translate-y-1',
      colorClasses[color],
    ]"
    @click="handleClick"
  >
    <!-- Colored accent bar -->
    <div
      class="absolute top-0 left-0 h-full w-1 transition-all duration-300"
      :class="[isActive ? 'w-full opacity-10' : 'w-1', `bg-${color}-500`]"
    />

    <div class="relative bg-white dark:bg-gray-900 p-5">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-4">
        <div
          class="flex items-center justify-center w-12 h-12 rounded-lg text-white text-xl flex-shrink-0"
          :class="`bg-${color}-500`"
        >
          <UIcon :name="icon" />
        </div>

        <div class="flex-1 min-w-0">
          <h3
            class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            {{ title }}
          </h3>
          <div class="flex items-center gap-2">
            <UIcon
              v-if="trend === 'up'"
              name="i-heroicons-arrow-trending-up"
              class="text-green-500 text-lg"
            />
            <UIcon
              v-else-if="trend === 'down'"
              name="i-heroicons-arrow-trending-down"
              class="text-red-500 text-lg"
            />
            <UIcon v-else name="i-heroicons-minus" class="text-gray-400 text-lg" />
            <span
              class="text-sm font-semibold"
              :class="{
                'text-green-600': trend === 'up',
                'text-red-600': trend === 'down',
                'text-gray-500': trend === 'stable',
              }"
            >
              {{ Math.abs(trendPercentage).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Value -->
      <div class="flex items-baseline gap-1 mb-2">
        <span v-if="unit === '$'" class="text-2xl font-bold text-gray-600 dark:text-gray-400">
          {{ unit }}
        </span>
        <span class="text-4xl font-bold text-gray-900 dark:text-white">
          {{ value.toLocaleString() }}
        </span>
        <span
          v-if="unit && unit !== '$'"
          class="text-2xl font-bold text-gray-600 dark:text-gray-400"
        >
          {{ unit }}
        </span>
      </div>

      <!-- Previous value -->
      <p v-if="previousValue" class="text-xs text-gray-500 dark:text-gray-400">
        Previous: {{ previousValue.toLocaleString() }}{{ unit && unit !== '$' ? unit : '' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* SafeList for Tailwind dynamic classes */
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
</style>

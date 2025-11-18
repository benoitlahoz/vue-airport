<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { DASHBOARD_DESK_KEY, type MetricWidget } from '.';

interface Props {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  icon?: string;
  timestamp: Date;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-bell',
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
    type: 'notification',
    title: props.title,
    description: props.description,
    priority: props.priority,
    category: props.category,
    icon: props.icon,
    timestamp: props.timestamp,
  }),
});

// Handle selection
const handleClick = () => {
  emit('select', props.id);
};

// Format time ago
const timeAgo = computed(() => {
  const seconds = Math.floor((new Date().getTime() - props.timestamp.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
});

// Priority classes
const priorityClasses = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  critical: 'priority-critical',
};

const priorityColors = {
  low: '#a0aec0',
  medium: '#4299e1',
  high: '#ed8936',
  critical: '#f56565',
};
</script>

<template>
  <div
    class="notification-widget"
    :class="[priorityClasses[priority], { active: isActive }]"
    @click="handleClick"
  >
    <div class="notification-header">
      <div class="notification-icon" :class="icon" />
      <div class="notification-meta">
        <div class="notification-badges">
          <span class="priority-badge" :style="{ background: priorityColors[priority] }">
            {{ priority }}
          </span>
          <span class="category-badge">{{ category }}</span>
        </div>
        <span class="notification-time">{{ timeAgo }}</span>
      </div>
    </div>

    <div class="notification-body">
      <h4 class="notification-title">{{ title }}</h4>
      <p class="notification-description">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.notification-widget {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  border-left: 4px solid;
  position: relative;
}

.notification-widget:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-widget.active {
  border-color: currentColor;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.priority-low {
  border-left-color: #a0aec0;
  color: #a0aec0;
}

.priority-medium {
  border-left-color: #4299e1;
  color: #4299e1;
}

.priority-high {
  border-left-color: #ed8936;
  color: #ed8936;
}

.priority-critical {
  border-left-color: #f56565;
  color: #f56565;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.2);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 101, 101, 0.4);
  }
}

.notification-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: currentColor;
  color: white;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.notification-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.priority-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.5rem;
  color: white;
  border-radius: 0.25rem;
}

.category-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.5rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 0.25rem;
}

.notification-time {
  font-size: 0.7rem;
  color: #a0aec0;
}

.notification-body {
  padding-left: 2.75rem;
}

.notification-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.notification-description {
  font-size: 0.85rem;
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
}
</style>

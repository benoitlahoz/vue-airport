<script setup lang="ts">
interface Activity {
  id: string;
  message: string;
  type: string;
  time: Date;
}

interface Props {
  activities: Activity[];
}

defineProps<Props>();

// Format time ago
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

// Activity type icons
const activityIcons: Record<string, string> = {
  info: 'i-lucide-info',
  success: 'i-lucide-check-circle',
  warning: 'i-lucide-alert-triangle',
  error: 'i-lucide-alert-circle',
};

// Activity type colors
const activityColors: Record<string, string> = {
  info: 'activity-info',
  success: 'activity-success',
  warning: 'activity-warning',
  error: 'activity-error',
};
</script>

<template>
  <div class="activity-widget">
    <div v-if="activities.length === 0" class="empty-state">
      <span class="i-lucide-inbox" />
      <p>No activity yet</p>
    </div>

    <div v-else class="activity-list">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity-item"
        :class="activityColors[activity.type]"
      >
        <div class="activity-icon" :class="activityIcons[activity.type]" />
        <div class="activity-content">
          <p class="activity-message">{{ activity.message }}</p>
          <span class="activity-time">{{ timeAgo(activity.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-widget {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #a0aec0;
}

.empty-state span {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.activity-item:hover {
  background: #f7fafc;
}

.activity-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.875rem;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #2d3748;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

.activity-info {
  border-left-color: #4299e1;
}

.activity-info .activity-icon {
  background: #bee3f8;
  color: #2c5282;
}

.activity-success {
  border-left-color: #48bb78;
}

.activity-success .activity-icon {
  background: #c6f6d5;
  color: #22543d;
}

.activity-warning {
  border-left-color: #ed8936;
}

.activity-warning .activity-icon {
  background: #feebc8;
  color: #7c2d12;
}

.activity-error {
  border-left-color: #f56565;
}

.activity-error .activity-icon {
  background: #fed7d7;
  color: #742a2a;
}

.activity-widget::-webkit-scrollbar {
  width: 0.5rem;
}

.activity-widget::-webkit-scrollbar-track {
  background: #edf2f7;
  border-radius: 0.25rem;
}

.activity-widget::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 0.25rem;
}

.activity-widget::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>

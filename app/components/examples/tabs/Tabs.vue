<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { type TabItemData, type TabItemContext, TABS_DESK_KEY, TabItem } from '.';

/**
 * Tabs Example - Dynamic Tab Management
 *
 * Demonstrates:
 * - Creating a desk with shared context
 * - Dynamic tab creation and deletion
 * - Desk as single source of truth
 * - Context sharing between components
 */

// Reactive reference to store the active tab ID
const activeTabId = ref<string | number>('tab-1');

// Create a desk with context to share the active tab state and helpers
const { createDesk } = useCheckIn<TabItemData, TabItemContext>();
const { desk } = createDesk(TABS_DESK_KEY, {
  devTools: true,
  debug: false,
  context: {
    activeTab: activeTabId,
    selectTab: (id: string | number) => {
      activeTabId.value = id;
    },
    closeTab: (id: string | number) => {
      // Keep at least one tab open
      if (desk.size.value <= 1) return;

      desk.checkOut(id);

      // If the active tab is closed, select the first available tab
      if (activeTabId.value === id && desk.registryList.value.length > 0) {
        const firstTab = desk.registryList.value[0];
        if (firstTab) {
          activeTabId.value = firstTab.id;
        }
      }
    },
    tabsCount: computed(() => desk.size.value),
  },
});

// Initialize tabs directly in the desk
desk.checkIn('tab-1', {
  label: 'Home',
  content: 'Welcome to the tabs demo!',
  icon: 'i-heroicons-home',
});

desk.checkIn('tab-2', {
  label: 'Settings',
  content: 'Application configuration',
  icon: 'i-heroicons-cog-6-tooth',
});

desk.checkIn('tab-3', {
  label: 'Profile',
  content: 'User information',
  icon: 'i-heroicons-user',
});

// Function to dynamically add a new tab
const addTab = () => {
  const id = `tab-${Date.now()}`;
  desk.checkIn(id, {
    label: `Tab ${desk.size.value + 1}`,
    content: `Content of tab ${desk.size.value + 1}`,
    icon: 'i-heroicons-document-text',
  });
  activeTabId.value = id;
};

// Computed property for the active tab's content
const activeTabContent = computed(() => {
  return desk.registryList.value.find((t) => t.id === activeTabId.value)?.data.content || '';
});
</script>

<template>
  <div>
    <div class="flex gap-4 items-center">
      <div class="flex gap-1 flex-1 overflow-x-auto">
        <!-- Note: no props, just the id -->
        <TabItem v-for="tab in desk.registryList.value" :id="tab.id" :key="tab.id" />
      </div>
      <UButton size="sm" icon="i-heroicons-plus" @click="addTab" />
    </div>

    <div
      class="relative overflow-hidden p-6 min-h-[150px] bg-gray-300 dark:bg-gray-700 rounded-bl-md rounded-br-md mb-2"
    >
      <Transition name="slide-fade" mode="out-in">
        <p :key="activeTabId">{{ activeTabContent }}</p>
      </Transition>
    </div>

    <div class="p-2 border border-gray-300 dark:border-gray-500 rounded-md text-xs">
      {{ desk.size.value }} tab(s), Active: {{ activeTabId }}
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>

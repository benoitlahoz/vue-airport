<script setup lang="ts">
import { ref } from 'vue';
import { useCheckIn } from 'vue-airport';
import { createActiveItemPlugin, createHistoryPlugin } from '@vue-airport/plugins-base';
import PluginListItem from './PluginListItem.vue';
import {
  type DeskWithPlugins,
  type PluginItemContext,
  type PluginItemData,
  PLUGIN_DESK_KEY,
} from '.';

/**
 * Plugin Example - Active Item and History
 *
 * Demonstrates:
 * - Using the ActiveItem plugin to manage selected items
 * - Using the History plugin to track operation history
 * - Real-time history of check-ins, check-outs, and updates
 * - Plugin type extensions
 */

// State to manage list items
const itemsData = ref<Array<PluginItemData>>([
  {
    id: 'item-1',
    name: 'First Item',
    description: 'This is the first item in the list',
  },
  {
    id: 'item-2',
    name: 'Second Item',
    description: 'This is the second item',
  },
  {
    id: 'item-3',
    name: 'Third Item',
    description: 'This is the third item',
  },
]);

// Create plugins for active item tracking and history management
const activeItemPlugin = createActiveItemPlugin<PluginItemData>();
const historyPlugin = createHistoryPlugin<PluginItemData>({ maxHistory: 20 });

// Create a desk with plugins enabled
const { createDesk } = useCheckIn<PluginItemData, PluginItemContext>();
const { desk } = createDesk(PLUGIN_DESK_KEY, {
  devTools: true,
  debug: false,
  plugins: [activeItemPlugin, historyPlugin],
  context: {
    pluginItems: itemsData,
  },
  onCheckOut(id) {
    // Remove item from local state on check-out
    const index = itemsData.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      // Deactivate the item if it was active
      if (deskWithPlugins.activeId?.value === id) {
        deskWithPlugins.setActive?.(null);
      }
      itemsData.value.splice(index, 1);
    }

    // Set active to the nearest item if any
    if (itemsData.value.length > 0) {
      const newIndex = Math.min(index, itemsData.value.length - 1);
      const id = itemsData.value[newIndex]?.id;
      if (id) {
        deskWithPlugins.setActive?.(id);
      }
    }
  },
});

const deskWithPlugins = desk as DeskWithPlugins;

// Computed properties for active item and history
const activeId = computed(() => deskWithPlugins.activeId?.value);
const activeItem = computed(() => deskWithPlugins.getActive?.());
const history = computed(() => deskWithPlugins.getHistory?.() || []);

// Function to add a new item
const addItem = () => {
  const id = `item-${Date.now()}`;
  itemsData.value.push({
    id,
    name: `Item ${itemsData.value.length + 1}`,
    description: `Description of item ${itemsData.value.length + 1}`,
  });

  // Automatically activate the new item
  deskWithPlugins.setActive?.(id);
};

// Helper to format action type for display
const formatAction = (action: string) => {
  const actionMap: Record<string, string> = {
    'check-in': 'Registered',
    'check-out': 'Unregistered',
    update: 'Updated',
  };
  return actionMap[action] || action;
};

// Activate the first item on component mount
onMounted(() => {
  const firstItem = itemsData.value[0];
  if (firstItem) {
    deskWithPlugins.setActive?.(firstItem.id);
  }
});
</script>

<template>
  <div>
    <div class="flex gap-3 mb-6 flex-wrap">
      <UButton icon="i-heroicons-plus" @click="addItem"> Add Item </UButton>
      <UBadge color="primary" variant="subtle"> {{ itemsData.length }} items </UBadge>
      <UBadge color="neutral" variant="subtle"> {{ history.length }} operations logged </UBadge>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Items list -->
      <div
        class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <h3 class="m-0 mb-4 text-base font-semibold">Items ({{ itemsData.length }})</h3>
        <ul class="list-none p-0 m-0 flex flex-col gap-2">
          <PluginListItem v-for="item in itemsData" :id="item.id" :key="item.id" />
        </ul>
      </div>

      <!-- Active item details -->
      <div
        class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <h3 class="m-0 mb-4 text-base font-semibold">Active Item</h3>
        <div v-if="activeItem" class="space-y-2">
          <p class="my-2"><strong>ID:</strong> {{ activeId }}</p>
          <p class="my-2"><strong>Name:</strong> {{ activeItem.data.name }}</p>
          <p class="my-2"><strong>Description:</strong> {{ activeItem.data.description }}</p>
          <p class="my-2 text-sm text-gray-600 dark:text-gray-400">
            <strong>Timestamp:</strong>
            {{ new Date(activeItem.timestamp || 0).toLocaleString() }}
          </p>
        </div>
        <div v-else class="py-8 text-center text-gray-600 dark:text-gray-400">No item selected</div>
      </div>

      <!-- History panel -->
      <div
        class="md:col-span-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
      >
        <h3 class="m-0 mb-4 text-base font-semibold">
          Operation History ({{ history.length }} / 20)
        </h3>
        <p class="mt-0 mb-4 text-sm text-gray-600 dark:text-gray-400">
          Tracks all check-ins, check-outs, and updates. Most recent operations appear first.
        </p>
        <ul class="list-none p-0 m-0 flex flex-col gap-2 max-h-[200px] overflow-y-auto">
          <li
            v-for="(entry, index) in history.slice().reverse()"
            :key="index"
            class="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm"
          >
            <UIcon
              :name="
                entry.action === 'check-in'
                  ? 'i-heroicons-plus-circle'
                  : entry.action === 'check-out'
                    ? 'i-heroicons-minus-circle'
                    : 'i-heroicons-arrow-path'
              "
              :class="
                entry.action === 'check-in'
                  ? 'text-green-500'
                  : entry.action === 'check-out'
                    ? 'text-red-500'
                    : 'text-blue-500'
              "
            />
            <span class="font-medium min-w-[100px]">{{ formatAction(entry.action) }}</span>
            <span class="flex-1 font-mono">{{ entry.id }}</span>
            <span class="text-gray-600 dark:text-gray-400 text-xs">
              {{ new Date(entry.timestamp).toLocaleTimeString() }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

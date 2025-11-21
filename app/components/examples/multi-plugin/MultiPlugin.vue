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

// Computed property for history
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
      <div class="p-4 bg-card border border-muted rounded-md">
        <h3 class="m-0 mb-4 text-base font-semibold">Items ({{ itemsData.length }})</h3>
        <ul class="list-none p-0 m-0 flex flex-col gap-2">
          <PluginListItem v-for="item in itemsData" :id="item.id" :key="item.id" />
        </ul>
      </div>

      <!-- Active item details -->
      <PluginActiveItemPanel />

      <!-- History panel -->
      <PluginHistoryPanel />
    </div>
  </div>
</template>

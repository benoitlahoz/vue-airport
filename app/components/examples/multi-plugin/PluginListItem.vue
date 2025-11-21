<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import {
  type DeskWithPlugins,
  type PluginItemContext,
  type PluginItemData,
  PLUGIN_DESK_KEY,
} from '.';

/**
 * Plugin List Item Component
 *
 * Individual list item that automatically checks in to the desk
 * and watches prop changes for synchronization.
 */

const props = defineProps<{
  id: string;
}>();

// Automatically check in to the desk with data watching enabled
const { checkIn } = useCheckIn<PluginItemData, PluginItemContext>();
const { desk } = checkIn(PLUGIN_DESK_KEY, {
  id: props.id,
  autoCheckIn: true,
  watchData: true,
  data: (desk) => {
    const item = desk.pluginItems?.value.find((i) => i.id === props.id);

    return {
      id: props.id,
      name: item?.name || '',
      description: item?.description || '',
      isActive: (desk as DeskWithPlugins).activeId?.value === props.id,
    };
  },
});

const deskWithPlugins = desk as typeof desk & DeskWithPlugins;

const data = computed(() => {
  return deskWithPlugins?.pluginItems.value.find((item) => item.id === props.id);
});

const isActive = computed(() => {
  return deskWithPlugins?.activeId?.value === props.id;
});

const setActive = () => {
  deskWithPlugins.setActive?.(props.id);
};

const remove = () => {
  deskWithPlugins.checkOut?.(props.id);
};
</script>

<template>
  <li
    class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    :class="{
      'bg-primary-50 dark:bg-primary-900/20 border-primary-500': isActive,
    }"
    @click="setActive"
  >
    <div class="flex flex-col gap-1">
      <strong>{{ data?.name }}</strong>
      <span class="text-xs text-gray-600 dark:text-gray-400">ID: {{ data?.id }}</span>
    </div>
    <UButton
      size="xs"
      color="error"
      variant="ghost"
      icon="i-heroicons-trash"
      @click.stop="remove"
    />
  </li>
</template>

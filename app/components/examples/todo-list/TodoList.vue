<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import TodoItem from './TodoItem.vue';
import { type TodoItemContext, type TodoItemData as TodoItemData, TODO_DESK_KEY } from '.';

/**
 * Create a desk to manage todo items
 * The desk acts as a central registry where child TodoItem components check in
 */
const { createDesk } = useCheckIn<TodoItemData, TodoItemContext>();
const { desk } = createDesk(TODO_DESK_KEY, {
  devTools: true,
  debug: false,
  onCheckIn: (id, data) => {
    console.log(`Item added: ${id}`, data);
  },
  onCheckOut: (id) => {
    console.log(`Item removed: ${id}`);
  },
  context: {
    toggleDone: (id: string | number) => {
      const item = desk.get(id);
      if (item) {
        desk.update(id, { done: !item.data.done });
      }
    },
    removeItem: (id: string | number) => {
      desk.checkOut(id);
    },
  },
});

/**
 * Add a new todo item directly to the desk
 */
const addItem = () => {
  const id = Date.now();
  desk.checkIn(id, {
    label: `Task ${id}`,
    done: false,
  });
};

/**
 * Clear all todos and reset the desk
 */
const clearAll = () => {
  desk.clear();
};
</script>

<template>
  <div>
    <div class="flex gap-3 items-center mb-6 flex-wrap">
      <div class="flex-1 flex gap-3">
        <UButton icon="i-heroicons-plus" @click="addItem"> Add Task </UButton>
        <UButton
          color="error"
          variant="soft"
          icon="i-heroicons-trash"
          :disabled="desk.size.value === 0"
          @click="clearAll"
        >
          Clear All
        </UButton>
      </div>
      <UBadge color="primary" variant="subtle"> {{ desk.size.value }} item(s) </UBadge>
    </div>

    <div
      v-if="desk.size.value === 0"
      class="p-8 flex flex-col items-center justify-center min-h-[150px] bg-gray-300 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
    >
      <p>No tasks.</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Click "Add Task" to create your first item.
      </p>
    </div>

    <ul
      v-else
      class="list-none min-h-[150px] bg-gray-300 dark:bg-gray-700 p-2 m-0 rounded-lg flex flex-col gap-2"
    >
      <TodoItem v-for="item in desk.registryList.value" :id="item.id" :key="item.id" />
    </ul>
  </div>
</template>

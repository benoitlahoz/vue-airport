<script setup lang="ts">
import { useCheckIn } from '#vue-airport';
import { createDebouncePlugin } from '@vue-airport/plugins-base';
import SearchResultItem from './SearchResultItem.vue';
import { type SearchContext, type SearchResult, SEARCH_DESK_KEY } from '.';
import { addEventLog } from './helpers';

/**
 * Debounce Plugin Example - Search Results
 *
 * Demonstrates:
 * - Debouncing check-in events
 * - Search-as-you-type functionality
 * - Event batching with maxWait
 * - Pending operations tracking
 * - Manual flush/cancel operations
 */

// Mock search database
const mockDatabase = [
  {
    id: 'vue-1',
    title: 'Vue 3 Composition API',
    description: 'Learn about the new Composition API',
    icon: 'vscode-icons:file-type-vue',
  },
  {
    id: 'vue-2',
    title: 'Vue Router',
    description: 'Official routing library',
    icon: 'vscode-icons:file-type-vue',
  },
  {
    id: 'vue-3',
    title: 'VueAirport Library',
    description: 'Generic check-in system for Vue',
    icon: 'vscode-icons:file-type-vue',
  },
  {
    id: 'ts-1',
    title: 'TypeScript Basics',
    description: 'Introduction to TypeScript',
    icon: 'vscode-icons:file-type-typescript-official',
  },
  {
    id: 'ts-2',
    title: 'TypeScript Advanced',
    description: 'Advanced TypeScript patterns',
    icon: 'vscode-icons:file-type-typescript-official',
  },
  {
    id: 'js-1',
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript features',
    icon: 'logos:javascript',
  },
  {
    id: 'js-2',
    title: 'Async/Await',
    description: 'Asynchronous programming',
    icon: 'logos:javascript',
  },
  {
    id: 'css-1',
    title: 'CSS Grid Layout',
    description: 'Master CSS Grid',
    icon: 'vscode-icons:file-type-css',
  },
  {
    id: 'css-2',
    title: 'Flexbox Guide',
    description: 'Complete flexbox guide',
    icon: 'vscode-icons:file-type-css',
  },
  {
    id: 'node-1',
    title: 'Node.js Fundamentals',
    description: 'Server-side JavaScript',
    icon: 'vscode-icons:file-type-node',
  },
];

// Search state
const searchQuery = ref('');
const isSearching = ref(false);
const lastDebouncedEventTime = ref<string>('Never');
const eventLog = ref<Array<{ time: string; message: string }>>([]);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const results = computed(() => {
  return desk.getAll().map((r) => r.data);
});

// Create debounce plugin with 500ms delay
const debouncePlugin = createDebouncePlugin<SearchResult>({
  checkInDelay: 5000,
  checkOutDelay: 300,
  maxWait: 10000, // Force execution after 10s max
});

// Create a desk with debounce plugin
const { createDesk } = useCheckIn<SearchResult, SearchContext>();
const { desk } = createDesk(SEARCH_DESK_KEY, {
  devTools: true,
  debug: false,
  plugins: [debouncePlugin],
  context: {
    searchResults: results,
  },
  onCheckIn(id) {
    // Log check-in events
    lastDebouncedEventTime.value = new Date().toLocaleTimeString();
    addEventLog(`Check-in fired for id: ${id}`, eventLog);
  },
  onCheckOut(id) {
    // Remove from local results on check-out of a child
    addEventLog(`Check-out fired for id: ${id}`, eventLog);
    const index = results.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      results.value.splice(index, 1);
    }
  },
});

const pendingCheckIns = computed(() => {
  // Sum of plugin debounce pending and local queue (if blockCheckIn)
  const pluginPending = (desk as any).pendingCheckInsCount || 0;
  const localPending = blockCheckIn.value ? pendingCheckInQueue.value.length : 0;
  return pluginPending + localPending;
});
const hasPendingDebounce = (desk as any).hasPendingDebounce;
const itemCount = computed(() => desk.size);

// Les boutons Flush/Cancel sont activés si le plugin a du pending OU si neverEndingPromise est actif OU si la file locale n'est pas vide
const hasPending = computed(() => {
  return (
    hasPendingDebounce ||
    !!neverEndingPromise ||
    (blockCheckIn.value && pendingCheckInQueue.value.length > 0)
  );
});

// Simulate a never-ending async operation for flush/cancel demo
let neverEndingPromise: Promise<void> | null = null;
let neverEndingResolve: (() => void) | null = null;

// Store the filtered search results (base) immediately
const filteredResults = ref<
  Array<{ id: string; title: string; description: string; icon: string }>
>([]);

// Option: block check-in until flush is clicked
const blockCheckIn = ref(false); // UI toggle
const pendingCheckInQueue = ref<Array<{ id: string; data: any }>>([]);

// Simulate search with debounced check-in, with optional block
const performSearch = async (query: string) => {
  if (query.trim() === '') {
    // Flush/cancel any pending debounce before clearing
    if (typeof (desk as any).cancelDebounce === 'function') {
      (desk as any).cancelDebounce(desk);
    }
    desk.clear();
    filteredResults.value = [];
    pendingCheckInQueue.value = [];
    addEventLog('Search cleared in performSearch', eventLog);
    return;
  }

  isSearching.value = true;
  addEventLog(`Search executing: "${query}"`, eventLog);

  // Simulate a never-ending operation if query is 'neverend'
  if (query.trim().toLowerCase() === 'neverend') {
    neverEndingPromise = new Promise((resolve) => {
      neverEndingResolve = resolve;
    });
    await neverEndingPromise;
    // After flush/cancel, continue
  } else {
    // Simulate variable delay for other searches
    const delay = 600 + Math.random() * 1200; // between 600ms and 1800ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Filter the mock database immediately for UI feedback
  const found = mockDatabase.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );
  filteredResults.value = found;

  // Ne pas clear le desk ici !
  pendingCheckInQueue.value = [];

  // Si blockCheckIn est activé, on stocke dans la file locale, sinon on checkIn (le plugin applique le délai)
  if (blockCheckIn.value) {
    for (const result of found) {
      pendingCheckInQueue.value.push({ id: result.id, data: result });
    }
    addEventLog(`Queued ${found.length} check-in(s) (blockCheckIn ON)`, eventLog);
  } else {
    for (const result of found) {
      desk.checkIn(result.id, result);
    }
    addEventLog(`checkIn called for ${found.length} result(s) (blockCheckIn OFF)`, eventLog);
  }
  isSearching.value = false;

  addEventLog(`Found ${found.length} results`, eventLog);
};

// Simulate a 500ms delay from the database
watch(searchQuery, (newQuery) => {
  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  if (newQuery.trim()) {
    // Show searching state immediately
    addEventLog(`Typing: "${newQuery}" (waiting for pause...)`, eventLog);
  } else {
    // If query is empty, clear results immediately
    desk.clear();
    addEventLog('Search cleared', eventLog);
  }

  // Set new timer to update debounced value
  searchDebounceTimer = setTimeout(() => {
    performSearch(newQuery);
    addEventLog(`Search debounced! Executing search...`, eventLog);
  }, 500);
});

// Manually flush debounced events and pending queue
const flushNow = () => {
  // If blockCheckIn is enabled, flush the local queue to the desk
  if (blockCheckIn.value && pendingCheckInQueue.value.length > 0) {
    for (const item of pendingCheckInQueue.value) {
      desk.checkIn(item.id, item.data);
    }
    addEventLog(`Flushed ${pendingCheckInQueue.value.length} queued check-in(s) to desk`, eventLog);
    pendingCheckInQueue.value = [];
  }
  // Always flush debounce plugin
  if (typeof (desk as any).flushDebounce === 'function') {
    (desk as any).flushDebounce(desk);
  }
  if (neverEndingResolve) {
    neverEndingResolve();
    neverEndingResolve = null;
    neverEndingPromise = null;
    addEventLog('Never-ending operation flushed!', eventLog);
  }
  addEventLog('Manually flushed debounced events', eventLog);
};

// Cancel pending debounced events
const cancelPending = () => {
  if (typeof (desk as any).cancelDebounce === 'function') {
    (desk as any).cancelDebounce(desk);
  }
  if (neverEndingResolve) {
    neverEndingResolve();
    neverEndingResolve = null;
    neverEndingPromise = null;
    addEventLog('Never-ending operation cancelled!', eventLog);
  }
  addEventLog('Cancelled pending debounced events', eventLog);
};

// Reset search
const resetSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchQuery.value = '';
  desk.clear();
  pendingCheckInQueue.value = [];
  cancelPending();
  isSearching.value = false;
  eventLog.value = [];
  addEventLog('Search reset', eventLog);
};
</script>

<template>
  <div>
    <!-- Search Controls -->
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Vue, CSS, Typescript, ..."
        class="mb-4"
      />

      <div class="flex gap-3 flex-wrap items-center">
        <UButton
          icon="i-heroicons-arrow-path"
          color="primary"
          :disabled="!hasPending"
          @click="flushNow"
        >
          Flush Now ({{ pendingCheckIns.value }})
        </UButton>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          :disabled="!hasPending"
          @click="cancelPending"
        >
          Cancel Pending
        </UButton>
        <UButton icon="i-heroicons-trash" color="error" @click="resetSearch"> Clear All </UButton>
        <!-- Toggle for blockCheckIn -->
        <label class="ml-4 flex items-center gap-2">
          <input v-model="blockCheckIn" type="checkbox" />
          <span class="text-sm">Block check-in until Flush</span>
        </label>
      </div>
    </div>

    <!-- Immediate search results (filtered base, not checked-in) -->
    <!-- This section shows what the user would get from the API/database, before debounce plugin check-in -->
    <div class="mb-8">
      <h3 class="font-semibold mb-2">Immediate Results (filtered, not checked-in)</h3>
      <ul>
        <li v-for="item in filteredResults" :key="item.id">
          <!-- Show title and description for clarity -->
          <span class="font-mono">{{ item.title }}</span>
          <span class="text-gray-500">- {{ item.description }}</span>
        </li>
        <li v-if="filteredResults.length === 0" class="text-gray-400">No results</li>
      </ul>
    </div>

    <!-- Checked-in results (debounced by plugin) -->
    <!-- This section shows only items that have been checked-in (after debounce or flush) -->
    <div class="mb-8">
      <h3 class="font-semibold mb-2">Checked-in Results (debounced by plugin)</h3>
      <ul>
        <li v-for="item in results" :key="item.id">
          <span class="font-mono">{{ item.title }}</span>
          <span class="text-gray-500">- {{ item.description }}</span>
        </li>
        <li v-if="results.length === 0" class="text-gray-400">No checked-in results</li>
      </ul>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Results Found (checked-in)
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ results.length }}
        </div>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Checked In
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ itemCount }}</div>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Pending Events
        </div>
        <div
          class="text-3xl font-bold"
          :class="
            hasPending
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-900 dark:text-gray-100'
          "
        >
          {{ pendingCheckIns.value }}
        </div>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Last Debounced Event
        </div>
        <div class="text-base font-bold text-gray-900 dark:text-gray-100">
          {{ lastDebouncedEventTime }}
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div class="mb-8 min-h-[300px]">
      <div
        v-if="isSearching"
        class="flex flex-col items-center justify-center gap-4 py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl" />
        Searching...
      </div>

      <div
        v-else-if="results.length === 0 && searchQuery"
        class="flex flex-col items-center justify-center gap-4 py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="text-5xl opacity-50" />
        <p>No results found for "{{ searchQuery }}"</p>
      </div>

      <div
        v-else-if="results.length === 0"
        class="flex flex-col items-center justify-center gap-4 py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-document-magnifying-glass" class="text-5xl opacity-50" />
        <p>Type to search...</p>
      </div>

      <TransitionGroup
        v-else
        name="list"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <SearchResultItem v-for="result in results" :id="result.id" :key="result.id" />
      </TransitionGroup>
    </div>

    <!-- Event Log -->
    <div
      class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Event Log</h3>
      <div class="max-h-[300px] overflow-y-auto">
        <TransitionGroup name="log" tag="div">
          <div
            v-for="(entry, index) in eventLog"
            :key="`${entry.time}-${index}`"
            class="flex gap-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm last:border-b-0"
          >
            <span class="text-gray-500 dark:text-gray-400 font-mono shrink-0">{{
              entry.time
            }}</span>
            <span class="text-gray-900 dark:text-gray-100">{{ entry.message }}</span>
          </div>
        </TransitionGroup>
        <div
          v-if="eventLog.length === 0"
          class="text-center py-8 text-gray-500 dark:text-gray-400 italic"
        >
          No events yet
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.log-enter-active,
.log-leave-active {
  transition: all 0.2s ease;
}

.log-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.log-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>

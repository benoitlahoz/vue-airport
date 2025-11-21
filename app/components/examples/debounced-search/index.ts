import type { InjectionKey, Ref } from 'vue';
import type { DeskCore } from '#vue-airport/composables/useCheckIn';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SearchContext {
  searchResults: Ref<SearchResult[]>;
}

export const SEARCH_DESK_KEY: InjectionKey<DeskCore<SearchResult>> = Symbol('searchDesk');

export { default as DebouncedSearch } from './DebouncedSearch.vue';
export { default as SearchResultItem } from './SearchResultItem.vue';

import type { InjectionKey } from 'vue';
import type { CheckInDesk } from '#vue-checkin/composables/useCheckIn';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export const CART_DESK_KEY: InjectionKey<CheckInDesk<CartItem>> = Symbol('cartDesk');

export { default as ShoppingCartExample } from './ShoppingCartExample.vue';
export { default as ProductCard } from './ProductCard.vue';

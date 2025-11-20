import type { InjectionKey, Ref } from 'vue';
import type { DeskCore } from '#vue-airport/composables/useCheckIn';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartContext {
  products: Ref<CartItem[]>;
}

export const CART_DESK_KEY: InjectionKey<DeskCore<CartItem> & CartContext> = Symbol('cartDesk');

export { default as ShoppingCart } from './ShoppingCart.vue';
export { default as ProductCard } from './ProductCard.vue';

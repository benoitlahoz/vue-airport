<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { type CartItem, type CartContext, CART_DESK_KEY } from '.';
import { Button } from '@/components/ui/button';

/**
 * Product Card Component
 * Automatically checks in and retrieves product data from desk context.
 */

const props = defineProps<{
  id: string;
}>();

// Check in to the cart desk and get context
const { checkIn } = useCheckIn<CartItem, CartContext>();
const { desk } = checkIn(CART_DESK_KEY, {
  id: props.id,
  autoCheckIn: false,
  watchData: true,
  data: (desk) => {
    const product = desk.products.value.find((p) => p.id === props.id);
    return {
      id: props.id,
      name: product?.name ?? '',
      price: product?.price ?? 0,
      quantity: product?.quantity ?? 1,
      imageUrl: product?.imageUrl,
    };
  },
});

// Get product data from context
const productData = computed(() => {
  return desk?.products?.value.find((p) => p.id === props.id);
});

// Check if product is in the cart (checked in to desk)
const isInCart = computed(() => desk?.has(props.id) ?? false);

// Function to add product to cart
const addToCart = () => {
  if (!productData.value) return;

  // If already in cart, just increment quantity
  if (desk?.has(props.id)) {
    const currentItem = desk.get(props.id);
    if (currentItem) {
      const newQty = currentItem.data.quantity + 1;
      desk.update(props.id, { quantity: newQty });
    }
  } else {
    // Add new item to cart by checking in
    desk?.checkIn(props.id, {
      id: props.id,
      name: productData.value.name,
      price: productData.value.price,
      quantity: productData.value.quantity,
      imageUrl: productData.value.imageUrl,
    });
  }
};
</script>

<template>
  <div
    class="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-card flex flex-col gap-2 transition-all duration-200 hover:border-primary hover:shadow-md"
  >
    <div class="flex justify-center items-center h-24 text-6xl text-primary opacity-70">
      <UIcon :name="productData?.imageUrl || 'i-heroicons-cube'" />
    </div>

    <div class="flex flex-col gap-1 flex-1">
      <h4 class="text-sm font-semibold m-0 truncate">{{ productData?.name }}</h4>
      <div class="text-lg font-bold text-primary">${{ productData?.price.toFixed(2) }}</div>
    </div>

    <div class="flex flex-col gap-1.5">
      <!-- Add to Cart button when not in cart -->
      <Button v-if="!isInCart" size="sm" @click="addToCart">
        <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckIn } from '#vue-airport/composables/useCheckIn';
import { ProductCard, type CartItem, type CartContext, CART_DESK_KEY } from '.';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Shopping Cart Example - E-commerce Cart
 *
 * Demonstrates:
 * - Context sharing between parent and child components
 * - Lifecycle hooks (onCheckIn, onCheckOut)
 * - Dynamic cart total calculation
 */

// Available products catalog
const products = ref<CartItem[]>([
  {
    id: 'product-1',
    name: 'Laptop Pro',
    price: 1299.99,
    quantity: 1,
    imageUrl: 'i-heroicons-computer-desktop',
  },
  {
    id: 'product-2',
    name: 'Wireless Mouse',
    price: 49.99,
    quantity: 1,
    imageUrl: 'i-heroicons-cursor-arrow-rays',
  },
  {
    id: 'product-3',
    name: 'Mechanical Keyboard',
    price: 159.99,
    quantity: 1,
    imageUrl: 'i-heroicons-command-line',
  },
  {
    id: 'product-4',
    name: 'USB-C Hub',
    price: 79.99,
    quantity: 1,
    imageUrl: 'i-heroicons-circle-stack',
  },
  {
    id: 'product-5',
    name: 'Monitor 27"',
    price: 399.99,
    quantity: 1,
    imageUrl: 'i-heroicons-tv',
  },
  {
    id: 'product-6',
    name: 'Webcam HD',
    price: 89.99,
    quantity: 1,
    imageUrl: 'i-heroicons-video-camera',
  },
]);

// Create a desk for the shopping cart with context
const { createDesk } = useCheckIn<CartItem, CartContext>();
const { desk } = createDesk(CART_DESK_KEY, {
  devTools: true,
  debug: false,
  context: {
    products,
  },
  onCheckIn: (_id, data) => {
    console.log(`Product added to cart: ${data.name}`);
  },
  onCheckOut: (id) => {
    console.log(`Product removed from cart: ${id}`);
  },
});

// Computed properties for cart data
const cartItems = computed(() => desk.getAll());
const cartCount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.data.quantity;
  }, 0);
});
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.data.price * item.data.quantity;
  }, 0);
});

// Function to remove item from cart
const removeFromCart = (id: string | number) => {
  if (window.confirm('Remove this item from cart?')) {
    desk.checkOut(id);
  }
};

// Function to update cart item quantity
const updateCartQuantity = (id: string | number, newQty: number) => {
  desk.update(id, { quantity: newQty });
};

// Function to clear the entire cart
const clearCart = () => {
  if (window.confirm('Do you really want to empty the cart?')) {
    desk.clear();
  }
};

// Function to proceed to checkout
const checkout = () => {
  if (cartItems.value.length === 0) {
    window.alert('Your cart is empty!');
    return;
  }

  const orderSummary = cartItems.value
    .map(
      (item) =>
        `${item.data.name} x${item.data.quantity} - $${(item.data.price * item.data.quantity).toFixed(2)}`
    )
    .join('\n');

  window.alert(
    `Order confirmed!\n\nSummary:\n${orderSummary}\n\nTotal: $${cartTotal.value.toFixed(2)}`
  );
  desk.clear();
};
</script>

<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8 mt-6">
      <!-- Products section -->
      <div>
        <div class="grid grid-cols-2 gap-4">
          <ProductCard v-for="product in products" :id="product.id" :key="product.id" />
        </div>
      </div>

      <!-- Shopping cart -->
      <div
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-card h-fit sticky top-4"
      >
        <div class="flex justify-between items-center mb-4">
          <Badge variant="outline" class="bg-primary/20 border-primary px-4 py-1">
            {{ desk.size }} type(s)
          </Badge>
          <Badge variant="outline" class="bg-primary/20 border-primary px-4 py-1">
            {{ cartCount }} item(s)
          </Badge>
        </div>

        <div
          v-if="cartItems.length === 0"
          class="text-center py-12 px-4 text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-shopping-cart" class="text-5xl mb-4 opacity-30" />
          <p>Your cart is empty</p>
        </div>

        <div v-else class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex flex-col gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <UIcon
                    :name="item.data.imageUrl || 'i-heroicons-cube'"
                    class="text-2xl text-primary"
                  />
                  <div class="flex flex-col gap-1">
                    <strong>{{ item.data.name }}</strong>
                    <span class="text-sm text-gray-500 dark:text-gray-400"
                      >${{ item.data.price.toFixed(2) }} each</span
                    >
                  </div>
                </div>
                <div class="font-semibold text-primary">
                  ${{ (item.data.price * item.data.quantity).toFixed(2) }}
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <Button
                    size="icon"
                    :disabled="item.data.quantity <= 1"
                    class="w-6 h-6 bg-primary/10 hover:bg-primary/20 text-primary"
                    @click="updateCartQuantity(item.id, item.data.quantity - 1)"
                  >
                    <UIcon name="i-heroicons-minus" class="w-4 h-4" />
                  </Button>
                  <span class="min-w-8 text-center font-semibold">{{ item.data.quantity }}</span>
                  <Button
                    size="icon"
                    class="w-6 h-6 bg-primary/10 hover:bg-primary/20 text-primary"
                    @click="updateCartQuantity(item.id, item.data.quantity + 1)"
                  >
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  class="text-xs h-6 bg-error/10 hover:bg-error/20 text-error"
                  @click="removeFromCart(item.id)"
                >
                  <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold">Total</span>
              <span class="text-2xl font-bold text-primary">${{ cartTotal.toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Button @click="checkout">
              <UIcon name="i-heroicons-check" class="w-4 h-4 mr-2" />
              Checkout
            </Button>
            <Button variant="destructive" @click="clearCart">
              <UIcon name="i-heroicons-trash" class="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

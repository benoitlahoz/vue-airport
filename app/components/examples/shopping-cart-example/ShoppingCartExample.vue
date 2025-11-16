<script setup lang="ts">
import { useCheckIn } from '#vue-checkin/composables/useCheckIn';
import ProductCard from './ProductCard.vue';
import { CART_DESK_KEY } from './index';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Créer un desk pour le panier
const { createDesk } = useCheckIn<CartItem>();
const { desk } = createDesk(CART_DESK_KEY, {
  debug: true,
  onCheckIn: (id, data) => {
    console.log(`✅ Produit ajouté au panier: ${data.name}`);
  },
  onCheckOut: (id) => {
    console.log(`❌ Produit retiré du panier: ${id}`);
  },
  onBeforeCheckOut: () => {
    const confirmed = confirm('Voulez-vous vraiment retirer ce produit du panier ?');
    return confirmed;
  },
});

// Produits disponibles
const products = ref([
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

// Computed pour le panier
const cartItems = computed(() => desk.getAll());
const cartCount = computed(() => desk.registry.value.size);
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.data.price * item.data.quantity);
  }, 0);
});

// Mettre à jour la quantité
const updateQuantity = (id: string, quantity: number) => {
  const product = products.value.find(p => p.id === id);
  if (product) {
    product.quantity = Math.max(1, quantity);
  }
};

// Vider le panier
const clearCart = () => {
  if (confirm('Voulez-vous vraiment vider le panier ?')) {
    desk.clear();
  }
};

// Procéder au paiement
const checkout = () => {
  if (cartItems.value.length === 0) {
    alert('Votre panier est vide !');
    return;
  }

  const orderSummary = cartItems.value
    .map(item => `${item.data.name} x${item.data.quantity} - ${(item.data.price * item.data.quantity).toFixed(2)}€`)
    .join('\n');

  alert(`Commande validée !\n\nRésumé:\n${orderSummary}\n\nTotal: ${cartTotal.value.toFixed(2)}€`);
  desk.clear();
};
</script>

<template>
  <div class="demo-container">
    <h2>Shopping Cart Example</h2>
    <p class="description">
      Panier d'achat e-commerce avec gestion des produits et calcul automatique du total.
    </p>

    <div class="shop-layout">
      <!-- Liste des produits -->
      <div class="products-section">
        <h3>Produits disponibles</h3>
        <div class="products-grid">
          <ProductCard
            v-for="product in products"
            :id="product.id"
            :key="product.id"
            :name="product.name"
            :price="product.price"
            :quantity="product.quantity"
            :image-url="product.imageUrl"
            @update-quantity="updateQuantity"
          />
        </div>
      </div>

      <!-- Panier -->
      <div class="cart-section">
        <div class="cart-header">
          <h3>Panier</h3>
          <UBadge color="primary" variant="subtle">
            {{ cartCount }} article(s)
          </UBadge>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <UIcon name="i-heroicons-shopping-cart" class="empty-icon" />
          <p>Votre panier est vide</p>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="cart-item"
            >
              <div class="item-info">
                <UIcon :name="item.data.imageUrl || 'i-heroicons-cube'" class="item-icon" />
                <div>
                  <strong>{{ item.data.name }}</strong>
                  <span class="item-quantity">Quantité: {{ item.data.quantity }}</span>
                </div>
              </div>
              <div class="item-price">
                {{ (item.data.price * item.data.quantity).toFixed(2) }}€
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <div class="total-line">
              <span class="total-label">Total</span>
              <span class="total-amount">{{ cartTotal.toFixed(2) }}€</span>
            </div>
          </div>

          <div class="cart-actions">
            <UButton
              color="primary"
              icon="i-heroicons-check"
              block
              @click="checkout"
            >
              Passer la commande
            </UButton>
            <UButton
              color="error"
              variant="soft"
              icon="i-heroicons-trash"
              block
              @click="clearCart"
            >
              Vider le panier
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 1.5rem;
  border: 1px solid var(--ui-border-primary);
  border-radius: 0.5rem;
  background: var(--ui-bg-elevated);
}

.description {
  color: var(--ui-text-muted);
  margin-bottom: 1.5rem;
}

.shop-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

@media (max-width: 1024px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }
}

.products-section h3 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.cart-section {
  border: 1px solid var(--ui-border-primary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: var(--ui-bg);
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ui-text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--ui-border-primary);
  border-radius: 0.375rem;
  background: var(--ui-bg-elevated);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  font-size: 1.5rem;
  color: var(--ui-primary);
}

.item-info > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-quantity {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.item-price {
  font-weight: 600;
  color: var(--ui-primary);
}

.cart-summary {
  border-top: 2px solid var(--ui-border-primary);
  padding-top: 1rem;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.125rem;
  font-weight: 600;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ui-primary);
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

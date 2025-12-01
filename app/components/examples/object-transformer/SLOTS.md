# ObjectTransformer - Système de Slots avec `data-slot` et `as-child`

## 🎯 Vue d'ensemble

Le système de slots de `ObjectTransformer` utilise l'attribut `data-slot` pour permettre une personnalisation complète de l'UI sans avoir besoin de slots nommés Vue. Cette approche s'inspire de **shadcn-vue** et **Radix UI**.

Toutes les constantes (noms de slots, clés interdites, etc.) sont définies dans `constants.ts` en **PascalCase** pour une meilleure cohérence et type-safety.

## 📚 Constantes Disponibles

```typescript
// constants.ts

// Noms de slots
export enum SlotName {
  ToggleIcon = 'toggle-icon',
  NodeValue = 'node-value',
  NodeActions = 'node-actions',
  TransformSelect = 'transform-select',
  NodeHeader = 'node-header',
  ChildrenContainer = 'children-container',
  TransformList = 'transform-list',
}

// Clés JavaScript interdites
export enum ForbiddenKey {
  Proto = '__proto__',
  Prototype = 'prototype',
  Constructor = 'constructor',
  ToString = 'toString',
  DefineGetter = '__defineGetter__',
  DefineSetter = '__defineSetter__',
  LookupGetter = '__lookupGetter__',
  LookupSetter = '__lookupSetter__',
}

// Liste des clés interdites
export const FORBIDDEN_KEYS: readonly string[] = Object.values(ForbiddenKey);

// Attributs HTML
export const DATA_SLOT_ATTRIBUTE = 'data-slot';
export const AS_CHILD_ATTRIBUTE = 'as-child';
```

## 📋 Slots Disponibles

Les noms de slots sont disponibles via l'enum `SlotName` :

```typescript
import { SlotName } from './constants';

// SlotName.ToggleIcon, SlotName.NodeValue, etc.
```

| Enum | Valeur | Description | Props reçus |
|------|--------|-------------|-------------|
| `SlotName.ToggleIcon` | `'toggle-icon'` | Icône pour ouvrir/fermer les nœuds | `{ isOpen, onClick, node }` |
| `SlotName.NodeValue` | `'node-value'` | Affichage de la valeur | `{ node, value, formattedValue, type }` |
| `SlotName.NodeActions` | `'node-actions'` | Boutons d'actions (delete/restore) | `{ node, isVisible, onToggle }` |
| `SlotName.TransformSelect` | `'transform-select'` | Sélecteur de transformation | `{ transforms, modelValue, onUpdate:modelValue }` |
| `SlotName.NodeHeader` | `'node-header'` | En-tête personnalisé (à venir) | `{ node }` |
| `SlotName.ChildrenContainer` | `'children-container'` | Conteneur des enfants (à venir) | `{ children, isOpen }` |
| `SlotName.TransformList` | `'transform-list'` | Liste des transformations (à venir) | `{ node, transforms }` |

## 🔧 Pattern `as-child`

Le pattern `as-child` (inspiré de Radix UI) permet de :
- **Sans `as-child`** : Utiliser le composant natif avec son style par défaut
- **Avec `as-child`** : Remplacer complètement le rendu par le contenu du slot

Tous les composants natifs (`TransformToggleIcon`, `TransformNodeValue`, `TransformNodeActions`, `TransformSelect`) supportent le pattern `as-child`.

### Exemple basique

```vue
<script setup lang="ts">
import { 
  ObjectTransformer, 
  TransformString, 
  TransformNumber,
  TransformToggleIcon,
  TransformNodeValue,
  SlotName 
} from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <!-- Transforms -->
    <TransformString />
    <TransformNumber />
    
    <!-- Utiliser les composants natifs par défaut -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" />
    <TransformNodeValue :data-slot="SlotName.NodeValue" />
  </ObjectTransformer>
</template>
```

### Exemple avec `as-child`

```vue
<script setup lang="ts">
import { SlotName, TransformToggleIcon, TransformNodeValue } from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <TransformString />
    
    <!-- Personnaliser avec as-child -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" as-child>
      <div class="text-xl cursor-pointer transition-transform" :class="{ 'rotate-90': isOpen }">
        ▶️
      </div>
    </TransformToggleIcon>
    
    <!-- Value personnalisée -->
    <TransformNodeValue :data-slot="SlotName.NodeValue" as-child>
      <code class="ml-2 font-mono text-sm px-1.5 py-0.5 rounded bg-accent">
        {{ formattedValue }}
      </code>
    </TransformNodeValue>
    
    <!-- Avec des composants shadcn -->
    <Button :data-slot="SlotName.ToggleIcon" variant="ghost" size="icon" as-child>
      <ChevronRight :class="{ 'rotate-90': isOpen }" />
    </Button>
  </ObjectTransformer>
</template>
```

## 🎨 Créer un Composant Custom

### Composants Natifs Disponibles

ObjectTransformer fournit des composants natifs qui supportent tous `as-child` :

- **`TransformToggleIcon`** : Icône de toggle (ChevronRight par défaut)
- **`TransformNodeValue`** : Affichage de la valeur
- **`TransformNodeActions`** : Boutons delete/restore
- **`TransformSelect`** : Sélecteur de transformation

### Structure de base pour un composant custom

Si vous voulez créer votre propre composant (au lieu d'utiliser les natifs) :

```vue
<script setup lang="ts">
interface Props {
  // Props reçues selon le slot
  isOpen?: boolean;
  onClick?: () => void;
  node?: any;
  // Pattern as-child
  asChild?: boolean;
}

defineProps<Props>();
</script>

<template>
  <!-- Si as-child, render le slot -->
  <slot v-if="asChild" />
  
  <!-- Sinon, render votre composant -->
  <button @click="onClick">
    {{ isOpen ? '▼' : '▶' }}
  </button>
</template>
```

### Exemple : Composant Toggle Personnalisé

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  isOpen?: boolean;
  asChild?: boolean;
}

defineProps<Props>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <slot v-if="asChild" />
  
  <button
    v-else
    @click="$emit('click')"
    :class="cn(
      'w-6 h-6 flex items-center justify-center transition-transform',
      isOpen && 'rotate-90'
    )"
  >
    ➡️
  </button>
</template>
```

### Exemple : Value avec styles conditionnels

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  formattedValue?: string;
  type?: string;
  asChild?: boolean;
}

defineProps<Props>();
</script>

<template>
  <slot v-if="asChild" />
  
  <code
    v-else
    :class="cn(
      'ml-2 font-mono text-sm px-1.5 py-0.5 rounded',
      type === 'string' && 'text-green-600 bg-green-50',
      type === 'number' && 'text-blue-600 bg-blue-50',
      type === 'boolean' && 'text-purple-600 bg-purple-50'
    )"
  >
    {{ formattedValue }}
  </code>
</template>
```

## 📦 Utilisation avec shadcn-vue

Combinez vos composants shadcn avec le système de slots :

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlotName, TransformToggleIcon, TransformNodeValue } from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <TransformString />
    <TransformNumber />
    
    <!-- Toggle avec TransformToggleIcon + as-child + Button shadcn -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" as-child>
      <Button variant="ghost" size="sm">
        <ChevronRight :class="{ 'rotate-90': isOpen }" />
      </Button>
    </TransformToggleIcon>
    
    <!-- Value avec Badge -->
    <TransformNodeValue :data-slot="SlotName.NodeValue" as-child>
      <Badge :variant="type === 'string' ? 'default' : 'secondary'">
        {{ formattedValue }}
      </Badge>
    </TransformNodeValue>
  </ObjectTransformer>
</template>
```

## 🏗️ Architecture Interne

### Le Desk comme Source de Vérité

Le **slot registry** est stocké dans le **desk** (pas de provide/inject nécessaire) :

```typescript
// Dans ObjectTransformer.vue
context: {
  // Slot Registry
  slotRegistry: ref<Record<string, any>>({}),
  registerSlots() {
    // Enregistre automatiquement tous les composants avec data-slot
  },
  getSlot(name: string) {
    return this.slotRegistry.value[name] || null;
  },
  hasSlot(name: string): boolean {
    return !!this.slotRegistry.value[name];
  },
  // ... reste du context
}
```

### Utilisation dans TransformerNode

```vue
<script setup lang="ts">
import { SlotName } from './constants';

const { checkIn } = useCheckIn();
const { desk } = checkIn(ObjectTransformerDeskKey);

// Vérifier si un slot custom existe
const hasCustomToggle = computed(() => desk.hasSlot(SlotName.ToggleIcon));

// Rendre le slot custom
const renderSlot = (slotName: string, props: any) => {
  const slotVNode = desk.getSlot(slotName);
  if (!slotVNode) return null;
  return h(slotVNode.type, { ...slotVNode.props, ...props });
};
</script>

<template>
  <!-- Utiliser le slot custom ou le défaut -->
  <component 
    :is="renderSlot(SlotName.ToggleIcon, { isOpen, onClick: toggleOpen })"
    v-if="hasCustomToggle"
  />
  <ChevronRight v-else @click="toggleOpen" />
</template>
```

## 💡 Avantages

✅ **Pas de slots nommés** : Utilisation déclarative via `data-slot`  
✅ **Pattern familier** : Similaire à shadcn-vue et Radix UI  
✅ **Type-safe** : Autocomplete des slots via TypeScript  
✅ **Flexible** : Mixez composants custom, wrappers et éléments natifs  
✅ **Desk centralisé** : Pas de provide/inject, tout passe par le desk  
✅ **Performance** : Enregistrement efficace au montage  

## 🎓 Exemples d'Utilisation

### Exemple 1 : Thème Minimal

```vue
<script setup lang="ts">
import { SlotName, TransformToggleIcon, TransformNodeValue } from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <TransformString />
    
    <!-- Toggle simple avec as-child -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" as-child>
      <span class="cursor-pointer">{{ isOpen ? '−' : '+' }}</span>
    </TransformToggleIcon>
    
    <!-- Value monospace -->
    <TransformNodeValue :data-slot="SlotName.NodeValue" as-child>
      <code class="font-mono text-xs">{{ formattedValue }}</code>
    </TransformNodeValue>
  </ObjectTransformer>
</template>
```

### Exemple 2 : Composants Natifs par Défaut

```vue
<script setup lang="ts">
import { SlotName, TransformToggleIcon, TransformNodeValue } from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <TransformString />
    <TransformNumber />
    
    <!-- Utiliser les composants natifs sans personnalisation -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" />
    <TransformNodeValue :data-slot="SlotName.NodeValue" />
  </ObjectTransformer>
</template>
```

### Exemple 3 : Thème avec Icons (lucide-vue)

```vue
<script setup lang="ts">
import { ChevronRight, Trash2, Undo } from 'lucide-vue-next';
import { SlotName, TransformToggleIcon, TransformNodeActions } from '.';
</script>

<template>
  <ObjectTransformer :data="data">
    <TransformString />
    
    <!-- Toggle avec icône lucide via as-child -->
    <TransformToggleIcon :data-slot="SlotName.ToggleIcon" as-child>
      <ChevronRight 
        class="w-4 h-4 cursor-pointer transition-transform"
        :class="{ 'rotate-90': isOpen }" 
      />
    </TransformToggleIcon>
    
    <!-- Actions custom -->
    <TransformNodeActions :data-slot="SlotName.NodeActions" as-child>
      <button class="p-1 hover:bg-accent rounded">
        <Trash2 v-if="!node.deleted" class="w-3 h-3" />
        <Undo v-else class="w-3 h-3" />
      </button>
    </TransformNodeActions>
  </ObjectTransformer>
</template>
```

## 🚀 Prochaines Étapes

- [ ] Ajouter plus de slots (`node-header`, `children-container`, etc.)
- [ ] Créer une bibliothèque de thèmes prédéfinis
- [ ] Documenter les variants avec CVA
- [ ] Ajouter des exemples de layouts alternatifs

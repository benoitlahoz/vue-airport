<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCheckIn } from 'vue-airport';
import type { ObjectNodeData, ObjectTransformerContext } from '.';
import { ObjectTransformerDeskKey } from '.';
import { Button } from './components/ui/button';
import { Copy, Check, Loader2, Play } from 'lucide-vue-next';

interface Props {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
});

const { checkIn } = useCheckIn<ObjectNodeData, ObjectTransformerContext>();
const { desk } = checkIn(ObjectTransformerDeskKey);

const isCopied = ref(false);
const isGenerating = ref(false);
const progress = ref(0);
const itemsProcessed = ref(0);
const totalItems = ref(0);
const previewCache = ref<any>(null);
const needsRegeneration = ref(true);

// Watch for changes that require preview regeneration
watch(
  () => desk?.recipe.value,
  () => {
    needsRegeneration.value = true;
    previewCache.value = null;
  },
  { deep: true }
);

watch(
  () => desk?.originalData.value,
  () => {
    needsRegeneration.value = true;
    previewCache.value = null;
  },
  { deep: true }
);

// Fonction récursive pour construire la valeur finale avec support des transformations structurelles imbriquées
const buildFinalValue = (node: ObjectNodeData): any => {
  if (node.deleted) return undefined;

  // Si le node a des enfants (résultat de transformations structurelles), construire depuis les enfants
  if (node.children && node.children.length > 0) {
    const activeChildren = node.children.filter((child) => !child.deleted);

    // Construire un array si le type est explicitement 'array'
    if (node.type === 'array') {
      const arr = activeChildren.map(buildFinalValue).filter((v) => v !== undefined);
      return applyNonStructuralTransforms(arr, node.transforms);
    }

    // Sinon, construire un objet (pour type 'object' ou transformations structurelles)
    if (node.type === 'object' || activeChildren.some((c) => c.key)) {
      const obj = activeChildren.reduce(
        (acc, child) => {
          const value = buildFinalValue(child); // Récursion
          if (value !== undefined && child.key) {
            acc[child.key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // Appliquer les transformations non-structurelles sur l'objet
      return applyNonStructuralTransforms(obj, node.transforms);
    }
  }

  // Pour les primitives sans enfants, appliquer toutes les transformations
  return applyNonStructuralTransforms(node.value, node.transforms);
};

// Appliquer uniquement les transformations non-structurelles
const applyNonStructuralTransforms = (value: any, transforms: any[] | undefined): any => {
  if (!transforms || transforms.length === 0) return value;

  let result = value;
  for (const transform of transforms) {
    const transformResult = transform.fn(result, ...(transform.params || []));
    // Ignorer les résultats structurels (déjà gérés par les enfants)
    if (
      !transformResult ||
      typeof transformResult !== 'object' ||
      !transformResult.__structuralChange
    ) {
      result = transformResult;
    }
  }
  return result;
};

// Generate preview with progress for large datasets
async function generateLargePreview(data: any[], recipe: any) {
  if (isGenerating.value) return;

  isGenerating.value = true;
  progress.value = 0;
  totalItems.value = data.length;
  itemsProcessed.value = 0;

  const result: any[] = [];
  const chunkSize = 100;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const transformed = chunk.map((item) => desk!.applyRecipe(item, recipe));
    result.push(...transformed);

    itemsProcessed.value = Math.min(i + chunkSize, data.length);
    progress.value = (itemsProcessed.value / totalItems.value) * 100;

    // Let the browser breathe
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  previewCache.value = result;
  isGenerating.value = false;
  needsRegeneration.value = false;
}

// Manual generation trigger
async function generatePreview() {
  if (!desk || !Array.isArray(desk.originalData.value)) return;

  const data = desk.originalData.value;
  const recipe = desk.recipe.value;

  await generateLargePreview(data, recipe);
}

const finalObject = computed(() => {
  if (!desk) return null;

  // Accès direct à tree.value pour établir la dépendance réactive
  const currentTree = desk.tree.value;

  // IMPORTANT: Access recipe to create dependency on key changes
  void desk.recipe.value;

  // En mode model avec lazy generation
  if (desk.mode.value === 'model' && Array.isArray(desk.originalData.value)) {
    // Return cached preview if available
    if (previewCache.value && !needsRegeneration.value) {
      return previewCache.value;
    }

    // For small datasets (< 500 items), generate synchronously
    const data = desk.originalData.value;
    if (data.length < 500) {
      const recipe = desk.recipe.value;
      return data.map((item) => desk.applyRecipe(item, recipe));
    }

    // For large datasets, return empty until manual generation
    return null;
  }

  // En mode object, construire récursivement depuis l'arbre
  return buildFinalValue(currentTree);
});

const formattedJson = computed(() => {
  if (!finalObject.value) return '';

  try {
    // Use custom replacer to show undefined values as null (JSON.stringify ignores undefined)
    return JSON.stringify(
      finalObject.value,
      (key, value) => {
        return value === undefined ? null : value;
      },
      2
    );
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unable to stringify object'}`;
  }
});

const showGenerateButton = computed(() => {
  return (
    desk?.mode.value === 'model' &&
    Array.isArray(desk?.originalData.value) &&
    desk.originalData.value.length >= 500 &&
    (!previewCache.value || needsRegeneration.value)
  );
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};
</script>

<template>
  <div
    data-slot="object-transformer-preview"
    class="relative group flex-1 min-h-0"
    :class="props.class"
  >
    <!-- Copy button -->
    <Button
      v-if="!showGenerateButton"
      size="icon"
      variant="ghost"
      class="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      :class="{ 'opacity-100!': isCopied }"
      @click="copyToClipboard"
    >
      <Check v-if="isCopied" class="h-3.5 w-3.5 text-primary" />
      <Copy v-else class="h-3.5 w-3.5" />
    </Button>

    <!-- Generate button for large datasets -->
    <div v-if="showGenerateButton" class="preview-generate-placeholder">
      <div class="preview-generate-content">
        <Play class="preview-generate-icon" />
        <h3 class="preview-generate-title">Large Dataset Preview</h3>
        <p class="preview-generate-text">
          {{ desk?.originalData.value?.length.toLocaleString() }} items detected
        </p>
        <Button @click="generatePreview" class="preview-generate-button"> Generate Preview </Button>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isGenerating" class="preview-loading-overlay">
      <div class="preview-loading-content">
        <Loader2 class="preview-loading-spinner" />
        <div class="preview-loading-text">
          Generating preview... {{ itemsProcessed.toLocaleString() }} /
          {{ totalItems.toLocaleString() }}
        </div>
        <!-- Custom progress bar -->
        <div class="preview-progress-bar">
          <div class="preview-progress-fill" :style="{ width: `${progress}%` }" />
        </div>
      </div>
    </div>

    <!-- Preview content -->
    <pre
      v-show="!showGenerateButton"
      class="text-xs bg-muted p-3 rounded overflow-x-auto overflow-y-auto h-full whitespace-pre-wrap wrap-break-word"
    ><code>{{ formattedJson }}</code></pre>
  </div>
</template>

<style scoped>
.preview-generate-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-muted);
  border-radius: 0.375rem;
}

.preview-generate-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.preview-generate-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-primary);
  opacity: 0.8;
}

.preview-generate-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.preview-generate-text {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin: 0;
}

.preview-generate-button {
  margin-top: 0.5rem;
}

.preview-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--color-background-rgb, 255, 255, 255), 0.95);
  backdrop-filter: blur(4px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.preview-loading-spinner {
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.preview-loading-text {
  font-size: 0.875rem;
  color: var(--color-foreground);
}

.preview-progress-bar {
  width: 16rem;
  height: 0.5rem;
  background: var(--color-muted);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.preview-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
  transition: width 0.3s ease-out;
}
</style>

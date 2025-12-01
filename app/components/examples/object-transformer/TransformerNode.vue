<script setup lang="ts">
import { computed, ref, type ComputedRef, watch, onUnmounted } from 'vue';
import { useCheckIn } from 'vue-airport';
import {
  TransformerNode,
  TransformerParamInput,
  type ObjectNode,
  type Transform,
  type ObjectNodeType,
  ObjectTransformerDeskKey,
  type ObjectTransformerContext,
} from '.';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Undo, Trash } from 'lucide-vue-next';

type DeskWithContext = typeof desk & ObjectTransformerContext;

const props = defineProps<{ tree: ObjectNode }>();

const { checkIn } = useCheckIn<ObjectNode, ObjectTransformerContext>();
const { desk } = checkIn(ObjectTransformerDeskKey);
const deskWithContext = desk as DeskWithContext;

const tree = ref(props.tree);

// Capture the original type once and keep it stable
const originalType = deskWithContext.getNodeType(props.tree);

const transforms: ComputedRef<Transform[]> = computed(() => {
  return deskWithContext.transforms.value;
});

// Transformations available for the main select (based on original type)
const availableTransforms = computed(() => {
  return transforms.value.filter((t) =>
    t.if({ ...tree.value, type: originalType as ObjectNodeType })
  );
});

// Transformations available for step selects (based on transformed type)
const availableStepTransforms = computed(() => {
  let transformedValue = tree.value.value;

  // Appliquer les transformations jusqu'à rencontrer une transformation structurelle
  for (const t of tree.value.transforms) {
    const result = t.fn(transformedValue, ...(t.params || []));

    // Si c'est une transformation structurelle, arrêter
    const isStructural = result && typeof result === 'object' && result.__structuralChange === true;
    if (isStructural) {
      break;
    }

    // Transformation normale
    transformedValue = result;
  }

  const transformedType = deskWithContext.getNodeType({ ...tree.value, value: transformedValue });
  return transforms.value.filter((t) =>
    t.if({ ...tree.value, type: transformedType as ObjectNodeType, value: transformedValue })
  );
});

const isOpen = ref(props.tree.isOpen ?? true);
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  // Persister l'état dans le node
  tree.value.isOpen = isOpen.value;
};

const nodeSelect = ref<string | null>(
  props.tree.transforms.length > 0 ? props.tree.transforms.at(-1)?.name || null : null
);
const stepSelect = ref<Record<number, string | null>>({});

const isPrimitive = computed(() => deskWithContext.primitiveTypes.includes(tree.value.type));
const editingKey = ref(false);
const tempKey = ref(props.tree.key);
const isHovered = ref(false);
const valueElement = ref<HTMLElement | null>(null);
const inputElement = ref<HTMLElement | null>(null);
const buttonElement = ref<HTMLElement | null>(null);
const inputFieldElement = ref<InstanceType<typeof Input> | null>(null);

// Gestionnaire de clic global pour fermer l'édition
function handleClickOutside(event: MouseEvent) {
  if (!editingKey.value) return;

  const target = event.target as Node;
  const clickedInput = inputElement.value?.contains(target);
  const clickedButton = buttonElement.value?.contains(target);

  if (!clickedInput && !clickedButton) {
    confirmKeyChange();
  }
}

// Ajouter/retirer le gestionnaire quand editingKey change
watch(editingKey, (isEditing) => {
  if (isEditing) {
    // Utiliser setTimeout pour éviter que le clic d'activation ne déclenche immédiatement la fermeture
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Calculer le padding-left pour aligner les transformations avec la valeur
const transformsPaddingLeft = computed(() => {
  if (!valueElement.value || !isPrimitive.value) return '0px';
  const rect = valueElement.value.getBoundingClientRect();
  const parentRect = valueElement.value.closest('.text-xs.mb-4')?.getBoundingClientRect();
  if (!parentRect) return '0px';
  return `${rect.left - parentRect.left}px`;
});

// Déterminer si la propriété a été ajoutée (issue d'un Split)
const isAddedProperty = computed(() => {
  const key = tree.value.key;
  if (!key) return false;
  // Une propriété ajoutée a une clé du format "parentKey_index"
  return /_\d+$/.test(key);
});

// Classes CSS pour la clé
const keyClasses = computed(() => {
  if (isAddedProperty.value) return 'font-semibold text-blue-600';
  if (tree.value.keyModified) return 'font-semibold text-yellow-600';
  return 'font-semibold';
});

// Générer une clé unique safe pour v-for
function getChildKey(child: ObjectNode, index: number): string {
  try {
    // Utiliser btoa pour encoder en base64 (safe pour HTML attributes)
    const valueStr = JSON.stringify(child.value);
    const encoded = btoa(encodeURIComponent(valueStr).slice(0, 100)); // Limiter la taille
    return `${child.key}-${index}-${encoded}`;
  } catch {
    // Fallback si stringify échoue (circular refs, etc.)
    return `${child.key}-${index}-${typeof child.value}-${Date.now()}`;
  }
}

function confirmKeyChange() {
  const newKey = tempKey.value?.trim();

  if (!newKey) {
    tempKey.value = props.tree.key;
    editingKey.value = false;
    isHovered.value = false;
    return;
  }

  if (!deskWithContext.sanitizeKey(newKey)) {
    tempKey.value = props.tree.key;
    editingKey.value = false;
    isHovered.value = false;
    return;
  }

  if (newKey === props.tree.key) {
    editingKey.value = false;
    isHovered.value = false;
    return;
  }

  const parent = props.tree.parent;

  if (parent?.type === 'object' && parent.children) {
    const finalKey = deskWithContext.autoRenameKey(parent, newKey);
    tree.value.key = finalKey;
    tree.value.keyModified = true; // Marquer la clé comme modifiée
    tempKey.value = finalKey;

    // Propager au parent pour recalculer l'objet avec la nouvelle clé
    deskWithContext.propagateTransform(parent);
  }

  editingKey.value = false;
  isHovered.value = false;
  // Forcer le blur de l'input
  if (inputFieldElement.value?.$el) {
    inputFieldElement.value.$el.blur();
  }
}

function cancelKeyChange() {
  tempKey.value = props.tree.key;
  editingKey.value = false;
  isHovered.value = false;
  // Forcer le blur de l'input
  if (inputFieldElement.value?.$el) {
    inputFieldElement.value.$el.blur();
  }
}

function toggleDelete() {
  tree.value.deleted = !tree.value.deleted;

  // Propager au parent pour recalculer l'objet sans cette propriété
  if (tree.value.parent) {
    deskWithContext.propagateTransform(tree.value.parent);
  }
}

function handleNodeTransform(name: unknown) {
  const transformName = typeof name === 'string' ? name : null;

  if (!transformName || transformName === 'None') {
    tree.value.transforms = [];
    nodeSelect.value = null;
    stepSelect.value = {};
    if (tree.value.parent) deskWithContext.propagateTransform(tree.value.parent);
    return;
  }

  const previousValue = nodeSelect.value;
  const shouldAdd = !previousValue || previousValue === '+';
  const shouldChange = previousValue && previousValue !== '+' && previousValue !== transformName;

  if (!shouldAdd && !shouldChange) return;

  // Si on change de transformation et qu'on a un parent, nettoyer les éventuels nœuds splittés
  if (shouldChange && tree.value.parent) {
    const baseKeyPrefix = (tree.value.key || 'part') + '_';
    const hasSplitNodes = tree.value.parent.children!.some(
      (child) => child !== tree.value && child.key?.startsWith(baseKeyPrefix)
    );

    if (hasSplitNodes) {
      // Supprimer tous les nœuds splittés
      tree.value.parent.children = tree.value.parent.children!.filter(
        (child) => child === tree.value || !child.key?.startsWith(baseKeyPrefix)
      );
    }
  }

  const entry = deskWithContext.createTransformEntry(transformName);
  if (!entry) return;

  if (shouldAdd) {
    tree.value.transforms.push(entry);
  } else {
    tree.value.transforms = [entry];
    stepSelect.value = {};
  }

  nodeSelect.value = transformName;

  // Propager d'abord au nœud lui-même pour traiter les transformations structurelles
  deskWithContext.propagateTransform(tree.value);

  // Puis propager au parent pour mettre à jour sa valeur
  if (tree.value.parent) deskWithContext.propagateTransform(tree.value.parent);
}

function handleStepTransform(index: number, name: unknown) {
  const transformName = typeof name === 'string' ? name : null;

  if (!transformName) return;

  if (transformName === 'None') {
    // Remove the selected transformation and all following ones from the pipeline
    tree.value.transforms.splice(index + 1);

    // Clean up stepSelect: keep only entries before the clicked select, then reset it to null
    const newStepSelect = Object.fromEntries(
      Object.entries(stepSelect.value).filter(([key]) => parseInt(key) < index + 1)
    );
    newStepSelect[index + 1] = null;
    stepSelect.value = newStepSelect;
  } else {
    const entry = deskWithContext.createTransformEntry(transformName);
    if (entry) {
      tree.value.transforms.splice(index + 1, 0, entry);
      stepSelect.value[index + 1] = tree.value.transforms[index + 1]?.name || null;
    }
  }

  // Propager d'abord au nœud lui-même pour traiter les transformations structurelles
  deskWithContext.propagateTransform(tree.value);

  // Puis propager au parent pour mettre à jour sa valeur
  if (tree.value.parent) deskWithContext.propagateTransform(tree.value.parent);
}

function getParamConfig(transformName: string, paramIndex: number) {
  return transforms.value.find((x) => x.name === transformName)?.params?.[paramIndex];
}

function getFormattedStepValue(index: number): string {
  const value = deskWithContext.computeStepValue(tree.value, index);
  const type = deskWithContext.getComputedValueType(tree.value, value);
  return deskWithContext.formatValue(value, type);
}

function isStructuralTransform(transformIndex: number): boolean {
  const t = tree.value.transforms[transformIndex];
  if (!t) return false;

  // Calculer la valeur jusqu'à cette transformation
  const value = deskWithContext.computeStepValue(tree.value, transformIndex);
  const result = t.fn(value, ...(t.params || []));

  return result && typeof result === 'object' && result.__structuralChange === true;
}
</script>

<template>
  <div class="text-xs mb-4" :class="{ 'opacity-50': tree.deleted }">
    <!-- Wrapper avec scroll horizontal -->
    <div class="overflow-x-auto">
      <div
        class="flex items-center justify-between gap-2 my-2 transition-all group hover:bg-accent/30 min-w-fit"
      >
        <!-- Partie gauche : chevron + delete + key + value -->
        <div class="flex items-center gap-2">
          <template v-if="tree.children?.length">
            <ChevronRight
              v-if="!isOpen"
              class="w-3 h-3 text-muted-foreground cursor-pointer shrink-0"
              @click="toggleOpen"
            />
            <ChevronDown
              v-else-if="isOpen"
              class="w-3 h-3 text-muted-foreground cursor-pointer shrink-0"
              @click="toggleOpen"
            />
          </template>
          <div v-else class="w-3 shrink-0" />

          <!-- Conteneur pour bouton + nom avec hover commun -->
          <div
            class="flex items-center transition-all group-hover:border-l-2 group-hover:border-primary group-hover:pl-2.5 -ml-0.5 pl-1.5"
            @mouseenter="isHovered = true"
            @mouseleave="!editingKey && (isHovered = false)"
          >
            <!-- Bouton Delete/Restore à gauche avec slide (apparaît au hover desktop ou en mode édition) -->
            <div
              v-if="tree.parent?.type === 'object' || tree.parent?.type === 'array'"
              ref="buttonElement"
              class="overflow-hidden transition-all duration-200"
              :class="isHovered || editingKey ? 'w-4 mr-1.5' : 'w-0'"
            >
              <Button
                variant="ghost"
                size="icon"
                class="h-4 w-4 p-0 shrink-0"
                :title="tree.deleted ? 'Restore property' : 'Delete property'"
                @click.stop="toggleDelete"
              >
                <Undo v-if="tree.deleted" class="w-3.5 h-3.5 text-muted-foreground" />
                <Trash v-else class="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>

            <div class="cursor-pointer flex items-center gap-2" @click="editingKey = true">
              <template v-if="editingKey">
                <div ref="inputElement">
                  <Input
                    ref="inputFieldElement"
                    v-model="tempKey"
                    class="h-6 px-2 py-0 text-xs"
                    autofocus
                    @keyup.enter="confirmKeyChange"
                    @keyup.esc="cancelKeyChange"
                    @click.stop
                  />
                </div>
              </template>

              <template v-else>
                <span :class="keyClasses">{{ tree.key }}</span>
              </template>
            </div>
          </div>

          <!-- Valeur s'affiche juste pour primitives (caché sur mobile) -->
          <template v-if="isPrimitive">
            <span ref="valueElement" class="hidden md:inline ml-2 text-muted-foreground">
              {{ deskWithContext.formatValue(tree.value, tree.type) }}
            </span>
          </template>
        </div>

        <!-- Select principal (partie droite sur desktop) -->
        <template v-if="availableTransforms.length > 0">
          <Select :model-value="nodeSelect" @update:model-value="handleNodeTransform">
            <!-- @vue-ignore -->
            <SelectTrigger
              size="xs"
              class="hidden md:flex px-2 py-1 group-hover:border-primary md:min-w-[120px]"
            >
              <SelectValue placeholder="+" class="text-xs">
                {{ nodeSelect || '+' }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent class="text-xs">
              <SelectGroup>
                <SelectLabel>Transformations</SelectLabel>
                <SelectItem value="None" class="text-xs">Remove all</SelectItem>
                <SelectItem
                  v-for="tr in availableTransforms"
                  :key="tr.name"
                  :value="tr.name"
                  class="text-xs"
                >
                  {{ tr.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </template>
      </div>

      <!-- Ligne mobile : valeur + select -->
      <div
        v-if="isPrimitive || availableTransforms.length > 0"
        class="flex md:hidden items-center justify-between gap-2 mt-1 ml-5 pl-1.5"
      >
        <span v-if="isPrimitive" class="text-muted-foreground text-xs">
          {{ deskWithContext.formatValue(tree.value, tree.type) }}
        </span>
        <span v-else class="flex-1"></span>

        <template v-if="availableTransforms.length > 0">
          <Select :model-value="nodeSelect" @update:model-value="handleNodeTransform">
            <!-- @vue-ignore -->
            <SelectTrigger size="xs" class="px-2 py-1">
              <SelectValue placeholder="+" class="text-xs">
                {{ nodeSelect || '+' }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent class="text-xs">
              <SelectGroup>
                <SelectLabel>Transformations</SelectLabel>
                <SelectItem value="None" class="text-xs">Remove all</SelectItem>
                <SelectItem
                  v-for="tr in availableTransforms"
                  :key="tr.name"
                  :value="tr.name"
                  class="text-xs"
                >
                  {{ tr.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </template>
      </div>
    </div>

    <template v-if="isOpen">
      <!-- Children récursifs -->
      <div v-if="tree.children?.length" class="ml-1 md:ml-1 border-l-2 pl-2 md:pl-2">
        <TransformerNode
          v-for="(child, index) in tree.children"
          :key="getChildKey(child, index)"
          :tree="child"
          class="ml-2 md:ml-4"
        />
      </div>

      <!-- Stack des transformations avec Select pour enchaîner -->
      <div
        v-if="tree.transforms.length"
        class="pl-0 md:pl-(--transforms-padding)"
        :style="{ '--transforms-padding': transformsPaddingLeft }"
      >
        <!-- Wrapper avec scroll horizontal pour les transformations -->
        <div class="overflow-x-auto">
          <div v-for="(t, index) in tree.transforms" :key="index" class="my-2">
            <!-- Carte sur mobile, ligne sur desktop -->
            <div
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2 md:p-0 border md:border-0 rounded-md md:rounded-none bg-card md:bg-transparent transition-all group hover:bg-accent/30 min-w-fit"
            >
              <span
                class="text-muted-foreground text-xs group-hover:border-l-2 group-hover:border-primary md:-ml-0.5 md:pl-1.5"
              >
                {{ getFormattedStepValue(index) }}
              </span>

              <template v-if="!isStructuralTransform(index)">
                <template v-if="availableStepTransforms.length > 1">
                  <div class="flex flex-col md:flex-row md:items-center gap-2">
                    <div v-if="t.params" class="flex flex-col md:flex-row gap-2">
                      <TransformerParamInput
                        v-for="(_p, pi) in t.params"
                        :key="`param-${index}-${pi}`"
                        v-model="t.params[pi]"
                        :config="getParamConfig(t.name, pi)"
                        @change="
                          () => {
                            deskWithContext.propagateTransform(tree);
                            if (tree.parent) deskWithContext.propagateTransform(tree.parent);
                          }
                        "
                      />
                    </div>

                    <Select
                      :model-value="stepSelect[index + 1]"
                      size="xs"
                      @update:model-value="(val) => handleStepTransform(index, val)"
                    >
                      <!-- @vue-ignore -->
                      <SelectTrigger
                        size="xs"
                        class="px-2 py-1 group-hover:border-primary w-full md:min-w-[120px] md:w-auto"
                      >
                        <SelectValue placeholder="+" class="text-xs">
                          {{ stepSelect[index + 1] || '+' }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent class="text-xs">
                        <SelectGroup>
                          <SelectLabel>Next Transformation</SelectLabel>
                          <SelectItem value="None" class="text-xs"
                            >Remove this & following</SelectItem
                          >
                          <SelectItem
                            v-for="tr in availableStepTransforms"
                            :key="tr.name"
                            :value="tr.name"
                            class="text-xs"
                          >
                            {{ tr.name }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </template>
              </template>

              <template v-else>
                <div v-if="t.params" class="flex flex-col md:flex-row gap-2">
                  <TransformerParamInput
                    v-for="(_p, pi) in t.params"
                    :key="`param-${index}-${pi}`"
                    v-model="t.params[pi]"
                    :config="getParamConfig(t.name, pi)"
                    @change="
                      () => {
                        deskWithContext.propagateTransform(tree);
                        if (tree.parent) deskWithContext.propagateTransform(tree.parent);
                      }
                    "
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

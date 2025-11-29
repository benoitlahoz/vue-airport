<script setup lang="ts">
import { computed, ref } from 'vue';
import { TransformNode, type NodeObject, type NodeTransform } from '.';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';

const props = defineProps<{ tree: NodeObject }>();

// Liste des transformations disponibles
const transforms: NodeTransform[] = [
  {
    name: 'To Uppercase',
    if: (node: NodeObject) => node.type === 'string',
    fn: (value: any) => value.toUpperCase(),
  },
  {
    name: 'To Lowercase',
    if: (node: NodeObject) => node.type === 'string',
    fn: (value: any) => value.toLowerCase(),
  },
  {
    name: 'To Capitalized',
    if: (node: NodeObject) => node.type === 'string',
    fn: (value: any) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  },
  {
    name: 'Increment',
    if: (node: NodeObject) => node.type === 'number',
    fn: (value: any) => value + 1,
  },
  {
    name: 'Decrement',
    if: (node: NodeObject) => node.type === 'number',
    fn: (value: any) => value - 1,
  },
  {
    name: 'Stringify',
    if: (node: NodeObject) => node.type === 'object' || node.type === 'array',
    fn: (value: any) => JSON.stringify(value),
  },
];

const selectedTransform = ref<string | null>(null);

// Vérifier si c'est une primitive
const isPrimitive = computed(() => !['object', 'array'].includes(props.tree.type));

// Valeur calculée après application cumulative des transformations
const currentValue = computed(() =>
  props.tree.transforms.reduce((val, t) => t.fn(val, ...(t.params || [])), props.tree.initialValue)
);

// Propagation ascendante pour mettre à jour les parents
function propagate(node: NodeObject) {
  if (!node) return;

  if (node.type === 'object') {
    node.initialValue =
      node.children?.reduce(
        (acc: any, child) => {
          acc[child.key!] = child.transforms.reduce(
            (v, t) => t.fn(v, ...(t.params || [])),
            child.initialValue
          );
          return acc;
        },
        {} as Record<string, any>
      ) || {};
  } else if (node.type === 'array') {
    node.initialValue =
      node.children?.map((child) =>
        child.transforms.reduce((v, t) => t.fn(v, ...(t.params || [])), child.initialValue)
      ) || [];
  }

  if (node.parent) propagate(node.parent);
}

// Transformations disponibles pour ce nœud
const availableTransforms = computed(() => transforms.filter((t) => t.if(props.tree)));

// Ajouter une transformation et recalculer
function handleTransformChange(name: string) {
  const transform = transforms.find((t) => t.name === name);
  if (!transform) return;

  props.tree.transforms.push(transform);

  if (props.tree.parent) propagate(props.tree.parent);
}
</script>

<template>
  <div class="text-xs">
    <!-- Nœud -->
    <div class="flex items-center gap-2 my-1">
      <span class="font-semibold">{{ tree.key }}</span>
      <template v-if="isPrimitive">
        <span class="ml-2">{{ currentValue }}</span>
      </template>
    </div>

    <!-- Affichage des transformations appliquées en stack -->
    <div class="ml-5 pl-2 border-l-2">
      <div v-for="(t, index) in tree.transforms" :key="index" class="flex items-center gap-2 my-1">
        <span class="text-blue-600 text-xs"
          >→ {{ t.name }}:
          {{
            tree.transforms
              .slice(0, index + 1)
              .reduce((val, tr) => tr.fn(val, ...(tr.params || [])), tree.initialValue)
          }}
        </span>
      </div>

      <!-- Select pour ajouter une nouvelle transformation -->
      <template v-if="availableTransforms.length > 0">
        <Select v-model="selectedTransform" @update:model-value="handleTransformChange">
          <SelectTrigger size="xs" class="px-2 py-1">
            <SelectValue placeholder="Add Transformation" class="text-xs" />
          </SelectTrigger>
          <SelectContent class="text-xs">
            <SelectGroup>
              <SelectLabel>Available Transformations</SelectLabel>
              <SelectItem
                v-for="transform in availableTransforms"
                :key="transform.name"
                :value="transform.name"
                class="text-xs"
              >
                {{ transform.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </template>
    </div>

    <!-- Children récursifs -->
    <div class="ml-5 border-l-2 pl-2" v-if="tree.children?.length">
      <TransformNode v-for="child in tree.children" :key="child.key || child.value" :tree="child" />
    </div>
  </div>
</template>

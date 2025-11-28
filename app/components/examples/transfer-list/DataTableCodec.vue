<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTableCodecNode from './DataTableCodecNode.vue';

// --- Types ---
type TransformParam = {
  name: string;
  type: 'string';
  label: string;
  default: any;
};

type Transform = {
  name: string;
  if: (val: any) => boolean;
  fn: (...args: any[]) => any;
  params: TransformParam[];
};

type TransformNode = {
  name?: string;
  params: Record<string, any>;
  children: TransformNode[]; // Tree structure
};

// --- Transform Definitions ---
const transforms: Transform[] = [
  { name: 'Uppercase', if: (v) => typeof v === 'string', fn: (v) => v.toUpperCase(), params: [] },
  { name: 'Lowercase', if: (v) => typeof v === 'string', fn: (v) => v.toLowerCase(), params: [] },
  {
    name: 'Capitalize',
    if: (v) => typeof v === 'string',
    fn: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
    params: [],
  },
  { name: 'Trim', if: (v) => typeof v === 'string', fn: (v) => v.trim(), params: [] },
  {
    name: 'Reverse',
    if: (v) => typeof v === 'string',
    fn: (v) => v.split('').reverse().join(''),
    params: [],
  },
  {
    name: 'Append Suffix',
    if: (v) => typeof v === 'string',
    fn: (v, suffix) => v + suffix,
    params: [{ name: 'suffix', type: 'string', label: 'Suffixe', default: 'X' }],
  },
  {
    name: 'Prepend Prefix',
    if: (v) => typeof v === 'string',
    fn: (v, prefix) => prefix + v,
    params: [{ name: 'prefix', type: 'string', label: 'Préfixe', default: 'X' }],
  },
  {
    name: 'Split',
    if: (v) => typeof v === 'string',
    fn: (v, delimiter) => v.split(delimiter || ','),
    params: [{ name: 'delimiter', type: 'string', label: 'Délimiteur', default: ',' }],
  },
  {
    name: 'Join',
    if: (v) => Array.isArray(v),
    fn: (arr, delimiter) => arr.join(delimiter || ','),
    params: [{ name: 'delimiter', type: 'string', label: 'Délimiteur', default: ',' }],
  },
];

// --- Root Value ---
const originalValue = ref<any>('John Doe');

// --- Root Node ---
const rootNode = reactive<TransformNode>({
  name: undefined,
  params: reactive({}),
  children: [],
});

// --- Tree Utilities ---
function createNode(name?: string): TransformNode {
  const params: Record<string, any> = reactive({});
  if (name) {
    const t = transforms.find((x) => x.name === name);
    if (t) t.params.forEach((p) => (params[p.name] = p.default));
  }
  return reactive({ name, params, children: [] });
}

function addRootNode(transformName: string) {
  rootNode.children.push(createNode(transformName));
}

function onAddChild(parent: TransformNode, index: number, transformName: string) {
  parent.children.push(createNode(transformName));
}

function onRemoveNode(parent: TransformNode[] | TransformNode, idx: number) {
  if (Array.isArray(parent)) parent.splice(idx, 1);
  else parent.children.splice(idx, 1);
}

function onUpdateParam(node: TransformNode, paramName: string, value: any) {
  node.params[paramName] = value;
}

// --- Execution Engine (recursive) ---
function applyNode(node: TransformNode, input: any): any {
  const t = transforms.find((x) => x.name === node.name)!;
  if (!t?.if(input)) return input;

  const args = t.params.map((p) => node.params[p.name]);
  const result = t.fn(input, ...args);

  // Split: crée dynamiquement les enfants si absent
  if (t && t.name === 'Split' && Array.isArray(result)) {
    if (node.children.length === 0) {
      // Crée un enfant vide par partie
      result.forEach(() => {
        node.children.push(createNode());
      });
    }
    // Applique chaque enfant à chaque partie
    return result.map((part, idx) => {
      const child = node.children[idx];
      return child ? applyNode(child, part) : part;
    });
  }

  // Si pas de transformation, retourne la valeur telle quelle
  if (!node.name) {
    // Applique les enfants si présents
    let out = input;
    node.children.forEach((child) => (out = applyNode(child, out)));
    return out;
  }

  // Non array → pipeline into children
  let out = result;
  node.children.forEach((child) => (out = applyNode(child, out)));
  return out;
}

const resultValue = computed(() => {
  return applyNode(rootNode, originalValue.value);
});
</script>

<template>
  <div class="space-y-6">
    <!-- ROOT TRANSFORM TREE UI -->
    <div class="border p-4 rounded">
      <h2 class="font-bold mb-2">Arbre des transformations</h2>

      <DataTableCodecNode
        :node="rootNode"
        :parent="null"
        :index="0"
        :transforms="transforms"
        :input-value="originalValue"
        @add-child="onAddChild"
        @remove="onRemoveNode"
        @update-param="onUpdateParam"
      />
    </div>

    <!-- Result Display -->
    <div class="font-mono border p-4 rounded">
      <div><strong>Valeur d'origine:</strong> {{ originalValue }}</div>

      <div v-if="Array.isArray(resultValue)">
        <strong>Résultat :</strong>
        <ul>
          <li v-for="(v, i) in resultValue" :key="i">{{ v }}</li>
        </ul>
      </div>

      <div v-else><strong>Résultat :</strong> {{ resultValue }}</div>
    </div>
  </div>
</template>

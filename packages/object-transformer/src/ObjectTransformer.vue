<script setup lang="ts">
import { toRef, type HTMLAttributes, shallowRef, computed } from 'vue';
import { useCheckIn, type DeskCore } from 'vue-airport';
import { cn } from './lib/utils';
import {
  ObjectTransformerDeskKey,
  type ObjectNodeData,
  type ObjectNodeType,
  type ObjectTransformerContext,
  type ObjectTransformerDesk,
  type TransformerMode,
  keyGuards,
  registerCommonStructuralHandlers,
} from '.';
import { buildNodeTree } from './utils/node/node-builder.util';
import { initializeTransformer } from './utils/initialization/initialize-transformer.util';
import { createDataWatcher } from './utils/initialization/create-data-watcher.util';
import { createTransformerContext } from './utils/context/create-transformer-context.util';
import { createNotificationPlugin, createStatePlugin } from '@vue-airport/plugins-base';

export interface ObjectTransformerProps {
  data?: Record<string, any> | any[];
  forbiddenKeys?: string[];
  mode?: TransformerMode;
  templateIndex?: number;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ObjectTransformerProps>(), {
  data: () => ({}),
  forbiddenKeys: () => keyGuards,
  mode: undefined,
  templateIndex: undefined,
  class: '',
});

const { createDesk } = useCheckIn<ObjectNodeData, ObjectTransformerContext>();

// Initialize transformer state
const initialization = initializeTransformer(props.data, props.mode, props.templateIndex);

const initialTree = buildNodeTree(
  initialization.initialData,
  Array.isArray(initialization.initialData) ? 'Array' : 'Object'
);

// Create plugins
const statePlugin = createStatePlugin({
  initialState: {
    mode: initialization.mode,
    templateIndex: initialization.templateIndex,
    originalData: props.data,
    tree: initialTree,
    treeKey: 0,
  },
});

// Desk reference for computed registries
const deskRef = shallowRef<DeskCore<any> | null>(null);

const transforms = computed(() => {
  if (!deskRef.value) return [];
  return deskRef.value.registryList.value
    .filter((item) => item.data?.type === 'transform-provider')
    .flatMap((item) => item.data.transforms || []);
});

const conditions = computed(() => {
  if (!deskRef.value) return [];
  return deskRef.value.registryList.value
    .filter((item) => item.data?.type === 'condition-provider')
    .flatMap((item) => item.data.conditions || []);
});

// Primitive types constant
const primitiveTypes: ObjectNodeType[] = [
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'undefined',
  'null',
  'date',
  'function',
];

// Create context first
const context = createTransformerContext({
  initialData: initialization.initialData,
  initialMode: initialization.mode,
  initialTemplateIndex: initialization.templateIndex,
  originalData: props.data,
  forbiddenKeys: props.forbiddenKeys || keyGuards,
  primitiveTypes,
  statePlugin,
  transforms,
  conditions,
});

// Create desk with context
const { desk } = createDesk(ObjectTransformerDeskKey, {
  devTools: true,
  context,
  plugins: [createNotificationPlugin(), statePlugin],
});

// Set desk reference
deskRef.value = desk as unknown as DeskCore<any>;

// Inject desk reference into context
context.setDesk(desk);

// Register common structural handlers once desk is created
registerCommonStructuralHandlers(desk as ObjectTransformerDesk);

// Watch for data changes
createDataWatcher({
  desk: desk as ObjectTransformerDesk,
  propsData: toRef(props, 'data'),
});

// Expose desk for parent components to access via template ref
defineExpose({
  desk,
  treeKey: context.treeKey,
});
</script>

<template>
  <div data-slot="object-transformer" :class="cn(props.class)">
    <slot :desk="desk" />
  </div>
</template>

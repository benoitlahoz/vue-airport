<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import type { ObjectTransformerContext, Transform, StructuralTransformResult } from '..';
import { ObjectTransformerDeskKey, registerStructuralTransformHandler } from '..';

type DeskWithContext = typeof desk & ObjectTransformerContext;

// Register structural transform handler for 'arrayToProperties'
registerStructuralTransformHandler('arrayToProperties', (current, lastKey, result) => {
  if (!Array.isArray(result.parts)) return;

  // Convert array to object with indexed keys
  const obj: Record<string, any> = {};
  result.parts.forEach((part: any, index: number) => {
    obj[index.toString()] = part;
  });
  current[lastKey] = obj;
});

const transforms: Transform[] = [
  {
    name: 'Join',
    if: (node) => node.type === 'array',
    params: [{ key: 'separator', label: 'Separator', type: 'string', default: ', ' }],
    fn: (v: any[], separator: string) => v.join(separator),
  },
  {
    name: 'Unique',
    if: (node) => node.type === 'array',
    fn: (v: any[]) => Array.from(new Set(v)),
  },
  {
    name: 'Filter Nulls',
    if: (node) => node.type === 'array',
    fn: (v: any[]) => v.filter((item) => item != null),
  },
  {
    name: 'Filter Undefined',
    if: (node) => node.type === 'array',
    fn: (v: any[]) => v.filter((item) => item !== undefined),
  },
  {
    name: 'Filter By Value',
    if: (node) => node.type === 'array',
    params: [{ key: 'value', label: 'Value', type: 'text', default: '' }],
    fn: (v: any[], value: any) => v.filter((item) => item === value),
  },
  {
    name: 'To Object',
    structural: true, // This is a structural transform
    if: (node) => node.type === 'array',
    fn: (v: any[]): StructuralTransformResult => ({
      __structuralChange: true,
      action: 'arrayToProperties',
      parts: v,
    }),
  },
  {
    name: 'To String',
    if: (node) => node.type === 'array',
    fn: (v: any) => JSON.stringify(v),
  },
];

const { checkIn } = useCheckIn<Transform, ObjectTransformerContext>();
const { desk } = checkIn(ObjectTransformerDeskKey, {
  id: 'array-transform',
  autoCheckIn: true,
});

onMounted(() => {
  const d = desk as DeskWithContext;
  d.addTransforms(...transforms);
});
</script>

<template>
  <!-- Linter -->
  <div class="hidden"></div>
</template>

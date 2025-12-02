<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import type { ObjectTransformerContext, Transform, StructuralTransformResult } from '..';
import { ObjectTransformerDeskKey } from '..';

type DeskWithContext = typeof desk & ObjectTransformerContext;

const transforms: Transform[] = [
  {
    name: 'Join',
    if: (node) => node.type === 'array',
    params: [{ key: 'separator', label: 'Separator', type: 'string', default: ', ' }],
    fn: (v: any[], separator: string) => v.join(separator),
  },
  {
    name: 'To Object',
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

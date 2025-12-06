<script setup lang="ts">
import { useCheckIn } from 'vue-airport';
import type { ObjectTransformerContext, Transform, TransformProvider } from '..';
import { ObjectTransformerDeskKey } from '..';

const transforms: Transform[] = [
  {
    name: 'Negate',
    applicableTo: ['boolean'],
    fn: (v: boolean) => {
      return !v;
    },
  },
  {
    name: 'To String',
    applicableTo: ['boolean'],
    fn: (v: boolean) => {
      // Safety check: only convert booleans with specific formatting
      if (typeof v !== 'boolean') {
        return String(v); // Fallback to standard String conversion
      }
      return String(v);
    },
  },
  {
    name: 'To Number',
    applicableTo: ['boolean'],
    fn: (v: boolean) => {
      // Safety check: only convert booleans
      if (typeof v !== 'boolean') {
        return Number(v); // Fallback to standard Number conversion for non-booleans
      }
      return v ? 1 : 0;
    },
  },
  {
    name: 'To Yes/No',
    applicableTo: ['boolean'],
    fn: (v: boolean) => {
      return v ? 'Yes' : 'No';
    },
  },
  {
    name: 'To On/Off',
    applicableTo: ['boolean'],
    fn: (v: boolean) => {
      return v ? 'On' : 'Off';
    },
  },
  {
    name: 'To Object',
    structural: true,
    applicableTo: ['boolean'],
    fn: (v: any) => {
      // Accept any value type after intermediate transformations
      // Wrap any value in an object structure
      return {
        __structuralChange: true,
        action: 'toObject' as const,
        object: {
          object: { value: v },
        },
        removeSource: false,
      };
    },
  },
];

const { checkIn } = useCheckIn<TransformProvider, ObjectTransformerContext>();
checkIn(ObjectTransformerDeskKey, {
  id: 'boolean-transform',
  autoCheckIn: true,
  data: {
    type: 'transform-provider',
    transforms,
  },
});
</script>

<template>
  <div class="hidden"></div>
</template>

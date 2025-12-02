<script setup lang="ts">
import {
  ObjectTransformer,
  ObjectPreview,
  RecipePreview,
  ObjectNode,
  TransformString,
  TransformNumber,
  TransformDate,
  TransformBoolean,
  TransformObject,
  TransformArray,
} from '.';

const data = {
  name: 'john doe',
  age: 30,
  dob: new Date('1993-05-15T00:00:00Z'),
  active: true,
  city: 'marseille',
  address: {
    street: '123 main st',
    zip: '13001',
    custom: {
      info: 'some custom info',
      tags: ['tag1', 'tag2'],
    },
  },
  hobbies: ['reading', 'traveling', 'swimming'],
};
</script>

<template>
  <div class="space-y-4 max-h-196 overflow-auto">
    <ObjectTransformer :data="data" class="flex md:flex-row w-full">
      <TransformString />
      <TransformNumber />
      <TransformDate />
      <TransformBoolean />
      <TransformObject />
      <TransformArray />

      <ObjectNode />

      <div class="flex-1 flex flex-col gap-2 h-full">
        <ObjectPreview />
        <RecipePreview />
      </div>
    </ObjectTransformer>
  </div>
</template>

<style scoped></style>

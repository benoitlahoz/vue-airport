<script setup lang="ts">
import {
  ObjectTransformer,
  TransformString,
  TransformNumber,
  TransformDate,
  TransformMisc,
  TransformBoolean,
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
  <ObjectTransformer :data="data">
    <TransformString />
    <TransformNumber />
    <TransformDate />
    <TransformBoolean />
    <TransformMisc />
  </ObjectTransformer>
</template>

<style scoped></style>

<script setup lang="ts">
import { useCheckIn } from '#vue-airport';
import type { Transform } from '.';
import { ObjectTransformerDeskKey } from '.';

const { checkIn } = useCheckIn<Transform>();
const { desk } = checkIn(ObjectTransformerDeskKey);
</script>

<template>
  <div></div>
</template>

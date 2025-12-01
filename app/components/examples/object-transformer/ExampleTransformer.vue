<script setup lang="ts">
import {
  ObjectTransformer,
  TransformerNode,
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
    <!-- Composants de transformation (enregistrés dans le desk) -->
    <TransformString />
    <TransformNumber />
    <TransformDate />
    <TransformBoolean />
    <TransformMisc />

    <!-- ✨ TransformerNode avec personnalisation via slots -->
    <TransformerNode>
      <!-- Décommenter pour personnaliser : -->
      <!-- <template #toggle-icon="{ isOpen, onClick }">
        <div class="text-xl cursor-pointer transition-transform" :class="{ 'rotate-90': isOpen }" @click="onClick">
          ▶️
        </div>
      </template>
      
      <template #node-value="{ formattedValue }">
        <code class="ml-2 font-mono text-sm px-1.5 py-0.5 rounded bg-accent">
          {{ formattedValue }}
        </code>
      </template> -->
    </TransformerNode>

    <!-- ✨ Option alternative : Remplacer complètement avec as-child -->
    <!-- <TransformerNode as-child>
      <div class="custom-node-implementation">
        <p>Votre implémentation custom du nœud ici</p>
      </div>
    </TransformerNode> -->
  </ObjectTransformer>
</template>

<style scoped></style>

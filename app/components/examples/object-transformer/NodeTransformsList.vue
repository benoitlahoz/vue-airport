<script setup lang="ts">
import TransformerParamInput from './TransformerParam.vue';
import TransformSelect from './transforms/TransformSelect.vue';
import type { ObjectNode, Transform } from './index';

interface Props {
  node: ObjectNode;
  transforms: Transform[];
  paddingLeft: string;
  isPrimitive: boolean;
  formatStepValue: (index: number) => string;
  isStructuralTransform: (index: number) => boolean;
  getParamConfig: (transformName: string, paramIndex: number) => any;
}

defineProps<Props>();

const emit = defineEmits<{
  stepTransform: [index: number, name: unknown];
  paramChange: [];
}>();

const stepSelect = defineModel<Record<number, string | null>>('stepSelect', { required: true });
</script>

<template>
  <div v-if="node.transforms.length" class="">
    <div class="md:overflow-x-auto">
      <div v-for="(t, index) in node.transforms" :key="index" class="my-2">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2 md:p-0 border md:border-0 rounded-md md:rounded-none bg-card md:bg-transparent transition-all group hover:bg-accent/30 min-w-fit"
        >
          <!-- Valeur transformée -->
          <span
            class="text-muted-foreground text-xs"
            :style="{ paddingLeft: paddingLeft }"
            :class="{ 'max-md:pl-0!': true }"
          >
            {{ formatStepValue(index) }}
          </span>

          <!-- Paramètres + Select suivant (si pas structurel) -->
          <template v-if="!isStructuralTransform(index)">
            <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <!-- Paramètres -->
              <div v-if="t.params" class="flex flex-col md:flex-row gap-2 md:gap-3">
                <TransformerParamInput
                  v-for="(_p, pi) in t.params"
                  :key="`param-${index}-${pi}`"
                  v-model="t.params[pi]"
                  :config="getParamConfig(t.name, pi)"
                  @change="emit('paramChange')"
                />
              </div>

              <!-- Select suivant -->
              <TransformSelect
                v-if="transforms.length > 1"
                :model-value="stepSelect[index + 1] ?? null"
                :transforms="transforms"
                remove-label="Remove this & following"
                class="w-full md:w-auto"
                @update:model-value="emit('stepTransform', index, $event)"
              />
            </div>
          </template>

          <!-- Si structurel, juste les params -->
          <template v-else>
            <div v-if="t.params" class="flex flex-col md:flex-row gap-2 md:gap-3">
              <TransformerParamInput
                v-for="(_p, pi) in t.params"
                :key="`param-${index}-${pi}`"
                v-model="t.params[pi]"
                :config="getParamConfig(t.name, pi)"
                @change="emit('paramChange')"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

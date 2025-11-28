<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Props
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
  children: TransformNode[];
};

const props = defineProps<{
  node: TransformNode;
  parent?: TransformNode[] | TransformNode;
  index: number;
  transforms: Transform[];
  inputValue?: any; // valeur d'entrée à ce niveau
}>();

const isOpen = ref(true);

// Calcule la valeur courante à ce niveau
const currentValue = computed(() => {
  const t = props.transforms.find((x) => x.name === props.node.name);
  if (!t) return props.inputValue;
  if (!t.if(props.inputValue)) return props.inputValue;
  const args = t.params.map((p) => props.node.params[p.name]);
  return t.fn(props.inputValue, ...args);
});

const emit = defineEmits<{
  (e: 'add-child', parent: TransformNode, index: number, transformName: string): void;
  (e: 'remove', parent: TransformNode[] | TransformNode, index: number): void;
  (e: 'update-param', node: TransformNode, paramName: string, value: any): void;
}>();

function handleAddChildTransform(value: any) {
  if (value != null) emit('add-child', props.node, -1, String(value));
}

function handleRemove() {
  if (props.parent) {
    emit('remove', props.parent, props.index);
  }
}

function handleParamInput(paramName: string, value: any) {
  emit('update-param', props.node, paramName, value);
}
</script>

<template>
  <div class="border-l pl-4 my-2">
    <div class="flex items-center gap-2 mb-2">
      <button class="text-xs px-1" @click="isOpen = !isOpen">
        <span v-if="isOpen">▼</span>
        <span v-else>▶</span>
      </button>
      <span class="font-semibold">{{ props.node.name }}</span>
      <button v-if="props.parent" class="text-red-500 text-xs" @click="handleRemove">
        Retirer
      </button>
    </div>

    <div v-if="isOpen" class="flex flex-row items-start gap-4">
      <!-- Colonne gauche : valeur courante -->
      <div class="min-w-[120px] font-mono text-sm py-1 px-2 border rounded">
        {{ currentValue }}
      </div>

      <!-- Colonne droite : transformation + params -->
      <div class="flex-1">
        <div v-if="props.parent" class="flex items-center gap-2 mb-2">
          <Select
            class="w-[140px]"
            @update:model-value="(value) => emit('update-param', props.node, 'name', value)"
          >
            <SelectTrigger
              ><SelectValue :placeholder="props.node.name || 'Transformation...'"
            /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in props.transforms" :key="t.name" :value="t.name">
                  <SelectLabel>{{ t.name }}</SelectLabel>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span class="text-xs text-gray-400">Transformation</span>
        </div>
        <div
          v-for="p in props.node.name
            ? props.transforms.find((t: Transform) => t.name === props.node.name)?.params || []
            : []"
          :key="p.name"
          class="mb-2"
        >
          <label class="block text-sm font-medium mb-1">{{ p.label }}</label>
          <Input
            type="text"
            :model-value="props.node.params[p.name]"
            @update:model-value="(val) => handleParamInput(p.name, val)"
          />
        </div>
        <Select
          class="mt-2 w-[180px]"
          @update:model-value="(value) => handleAddChildTransform(value)"
        >
          <SelectTrigger
            ><SelectValue placeholder="Ajouter une sous-transformation"
          /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="t in props.transforms" :key="t.name" :value="t.name">
                <SelectLabel>{{ t.name }}</SelectLabel>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Children : stack verticale -->
    <div v-if="isOpen && props.node.children.length" class="ml-6 mt-2 border-l-2 border-gray-200">
      <DataTableCodecNode
        v-for="(child, cidx) in props.node.children"
        :key="cidx"
        :node="child"
        :parent="props.node"
        :index="cidx"
        :transforms="props.transforms"
        :input-value="Array.isArray(currentValue) ? currentValue[cidx] : currentValue"
        @add-child="(...args) => emit('add-child', ...args)"
        @remove="(...args) => emit('remove', ...args)"
        @update-param="(...args) => emit('update-param', ...args)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCheckIn } from 'vue-airport';
import {
  ObjectTransformerNode,
  ObjectTransformerDeskKey,
  type ObjectNode,
  type ObjectNodeType,
  type Transform,
  type ObjectTransformerContext,
  type ObjectTransformerDesk,
} from '.';

function buildNodeTree(value: any, key?: string, parent?: ObjectNode): ObjectNode {
  // Handle null first (before typeof checks)
  if (value === null) {
    return {
      type: 'null',
      key,
      value: null,
      transforms: [],
      parent,
    };
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const node: ObjectNode = {
      type: 'array',
      key,
      value: [],
      transforms: [],
      children: [],
      parent,
    };

    node.children = value.map((item, index) => buildNodeTree(item, String(index), node));

    // Build the initial value from children
    node.value = node.children.map((c) => c.value);

    return node;
  }

  // Handle Date objects
  if (value instanceof Date) {
    return {
      type: 'date',
      key,
      value,
      transforms: [],
      parent,
    };
  }

  // Handle objects (after Date check since Date is also an object)
  if (typeof value === 'object') {
    const node: ObjectNode = {
      type: 'object',
      key,
      value: {},
      transforms: [],
      children: [],
      parent,
    };

    node.children = Object.entries(value).map(([k, v]) => buildNodeTree(v, k, node));

    // Build the initial value from children
    node.value = node.children.reduce(
      (acc, c) => {
        acc[c.key!] = c.value;
        return acc;
      },
      {} as Record<string, any>
    );

    return node;
  }

  // Handle primitives and other types
  const typeOf = typeof value;
  let type: ObjectNodeType;

  switch (typeOf) {
    case 'string':
      type = 'string';
      break;
    case 'number':
      type = 'number';
      break;
    case 'bigint':
      type = 'bigint';
      break;
    case 'boolean':
      type = 'boolean';
      break;
    case 'symbol':
      type = 'symbol';
      break;
    case 'undefined':
      type = 'undefined';
      break;
    case 'function':
      type = 'function';
      break;
    default:
      type = 'unknown';
  }

  return {
    type,
    key,
    value: value,
    transforms: [],
    parent,
  };
}

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

const tree = ref<ObjectNode>(buildNodeTree(data, 'Object'));

const { createDesk } = useCheckIn<ObjectNode, ObjectTransformerContext>();
const { desk } = createDesk(ObjectTransformerDeskKey, {
  devTools: true,
  context: {
    // Constants
    primitiveTypes: [
      'string',
      'number',
      'boolean',
      'bigint',
      'symbol',
      'undefined',
      'null',
      'date',
      'function',
    ] as ObjectNodeType[],

    // Transforms
    transforms: ref<Transform[]>([]),
    addTransforms(...newTransforms: Transform[]) {
      this.transforms.value.push(...newTransforms);
    },
    findTransform(name: string): Transform | undefined {
      return this.transforms.value.find((t) => t.name === name);
    },
    initParams(transform: Transform) {
      return transform.params?.map((p) => p.default ?? null) || [];
    },
    createTransformEntry(name: string) {
      const transform = this.findTransform(name);
      return transform ? { ...transform, params: this.initParams(transform) } : null;
    },
    propagateTransform(node: ObjectNode) {
      if (!node) return;

      if (node.type === 'object') {
        node.value =
          node.children?.reduce(
            (acc: any, child) => {
              acc[child.key!] = child.transforms.reduce(
                (v, t) => t.fn(v, ...(t.params || [])),
                child.value
              );
              return acc;
            },
            {} as Record<string, any>
          ) || {};
      } else if (node.type === 'array') {
        node.value =
          node.children?.map((child) =>
            child.transforms.reduce((v, t) => t.fn(v, ...(t.params || [])), child.value)
          ) || [];
      }

      if (node.parent) (desk as ObjectTransformerDesk).propagateTransform(node.parent);
    },
    computeStepValue(node: ObjectNode, index: number) {
      return node.transforms
        .slice(0, index + 1)
        .reduce((val, t) => t.fn(val, ...(t.params || [])), node.value);
    },

    // Nodes
    forbiddenKeys: ref<string[]>([
      '__proto__',
      'prototype',
      'constructor',
      'toString',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
    ]),
    sanitizeKey(key: string): string | null {
      if (!key) return null;
      if (this.forbiddenKeys.value.includes(key)) return null;
      if (key.startsWith('__') && key.endsWith('__')) return null;
      if (key.includes('.')) return null;
      return key;
    },
    autoRenameKey(parent: ObjectNode, base: string): string {
      let safeBase = this.sanitizeKey(base);
      if (!safeBase) safeBase = 'key';

      if (!parent.children?.some((c) => c.key === safeBase)) {
        return safeBase;
      }

      let i = 1;
      let candidate = `${safeBase}_${i}`;

      while (parent.children?.some((c) => c.key === candidate)) {
        i++;
        candidate = `${safeBase}_${i}`;
      }

      return candidate;
    },
    getNodeType(node: ObjectNode) {
      let value = node.value;

      for (const t of node.transforms) {
        value = t.fn(value, ...(t.params || []));
      }

      const t = typeof value;
      if (t === 'string') return 'string';
      if (t === 'symbol') return 'symbol';
      if (t === 'number') return 'number';
      if (t === 'bigint') return 'bigint';
      if (t === 'boolean') return 'boolean';
      if (t === 'undefined') return 'undefined';
      if (t === 'function') return 'function';
      if (t === null) return 'null';
      if (Array.isArray(value)) return 'array';
      if (value instanceof Date) return 'date';
      if (value && typeof value === 'object') return 'object';
      return 'unknown';
    },
    getComputedValueType(node: ObjectNode, value: any): ObjectNodeType {
      return this.getNodeType({ ...node, value });
    },
    formatValue(value: any, type: ObjectNodeType): string {
      const formatters: Partial<Record<ObjectNodeType, (v: any) => string>> = {
        date: (v) => (v instanceof Date ? v.toISOString() : String(v)),
        function: (v) => `[Function: ${v.name || 'anonymous'}]`,
        bigint: (v) => `${v}n`,
        symbol: (v) => v.toString(),
        undefined: () => 'undefined',
        null: () => 'null',
      };
      return formatters[type]?.(value) ?? String(value);
    },
  },
});
</script>

<template>
  <ObjectTransformerNode :tree="tree" />
  <slot />
</template>

<style scoped></style>

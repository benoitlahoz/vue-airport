import type { InjectionKey, Ref } from 'vue';

export type NodeType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'symbol'
  | 'boolean'
  | 'object'
  | 'array'
  | 'undefined'
  | 'function'
  | 'null';

export interface Transform {
  name: string;
  if: (node: ObjectNode) => boolean;
  fn: (value: any, ...params: any[]) => any;
  params?: any[];
}

export interface ObjectNode {
  type: NodeType;
  key?: string; // pour les propriétés / index
  initialValue: any; // valeur brute ou conteneur
  transforms: Transform[]; // transformations successives
  children?: ObjectNode[]; // pour object / array
  parent?: ObjectNode;
}

export const ObjectTransformerDeskKey: InjectionKey<Ref<ObjectNode>> =
  Symbol('ObjectTransformerDesk');

export { default as ObjectTransformer } from './ObjectTransformer.vue';
export { default as ObjectTransformerNode } from './ObjectTransformerNode.vue';

// Transforms
export { default as TransformString } from './TransformString.vue';

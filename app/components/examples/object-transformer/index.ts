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
  if: (node: NodeObject) => boolean;
  fn: (value: any, ...params: any[]) => any;
  params?: any[];
}

export interface NodeObject {
  type: NodeType;
  key?: string; // pour les propriétés / index
  initialValue: any; // valeur brute ou conteneur
  transforms: Transform[]; // transformations successives
  children?: NodeObject[]; // pour object / array
  parent?: NodeObject;
}

export const ObjectTransformerDeskKey: InjectionKey<Ref<NodeObject>> =
  Symbol('ObjectTransformerDesk');

export { default as ObjectTransformer } from './ObjectTransformer.vue';
export { default as ObjectTransformerNode } from './ObjectTransformerNode.vue';

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

export interface NodeTransform {
  name: string;
  if: (node: NodeObject) => boolean;
  fn: (value: any, ...params: any[]) => any;
  params?: any[];
}

export interface NodeObject {
  type: NodeType;
  key?: string; // pour les propriétés / index
  initialValue: any; // valeur brute ou conteneur
  transforms: NodeTransform[]; // transformations successives
  children?: NodeObject[]; // pour object / array
  parent?: NodeObject;
}

export const TransformObjectDeskKey: InjectionKey<Ref<NodeObject>> = Symbol('TransformObjectDesk');

export { default as TransformObject } from './TransformObject.vue';
export { default as TransformNode } from './TransformNode.vue';

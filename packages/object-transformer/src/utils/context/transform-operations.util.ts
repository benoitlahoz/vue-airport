import type { Ref } from 'vue';
import { triggerRef } from 'vue';
import type { ObjectNodeData, Transform } from '../../types';
import {
  createPropagateTransform,
  computeStepValue,
} from '../transform/transform-propagation.util';

export interface TransformOperationsContext {
  tree: Ref<ObjectNodeData>;
  transforms: Ref<Transform[]>;
  deskRef?: () => any; // Function to get desk reference (avoids circular dependency)
}

export function createTransformOperationsMethods(context: TransformOperationsContext) {
  return {
    addTransforms(...newTransforms: Transform[]) {
      context.transforms.value.push(...newTransforms);
    },

    findTransform(name: string, node?: ObjectNodeData): Transform | undefined {
      // If node is provided, filter by type compatibility
      if (node) {
        return context.transforms.value.find((t) => t.name === name && t.if(node));
      }
      return context.transforms.value.find((t) => t.name === name);
    },

    initParams(transform: Transform) {
      // Extract default VALUES from param configs
      return transform.params?.map((p) => p.default ?? null) || [];
    },

    createTransformEntry(name: string, node?: ObjectNodeData) {
      // If node is provided, filter by type compatibility
      const transform = node
        ? context.transforms.value.find((t) => t.name === name && t.if(node))
        : context.transforms.value.find((t) => t.name === name);

      if (!transform) return null;

      console.log('[DEBUG] createTransformEntry:', {
        name,
        foundTransform: !!transform,
        transformFn: transform.fn.toString().substring(0, 100),
        structural: (transform as any).structural,
        nodeType: node?.type,
      });

      // Create a copy with params as VALUES array (not configs)
      return {
        ...transform,
        params: transform.params?.map((p) => p.default ?? null) || [],
      };
    },

    propagateTransform(node: ObjectNodeData) {
      const desk = context.deskRef?.();
      const propagate = createPropagateTransform(desk);
      propagate(node);
      triggerRef(context.tree); // Trigger reactivity after any transform change
    },

    computeStepValue,
  };
}

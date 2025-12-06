import { computed, type Ref } from 'vue';
import { triggerRef } from 'vue';
import { maybe, when } from 'vue-airport';
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
  // 🟢 OPTIMIZATION: Map-based index for O(1) transform lookup
  const transformsByName = computed(() => {
    const map = new Map<string, Transform[]>();
    for (const transform of context.transforms.value) {
      const existing = map.get(transform.name);
      if (existing) {
        existing.push(transform);
      } else {
        map.set(transform.name, [transform]);
      }
    }
    return map;
  });

  // Helper function to check if a transform is applicable to a node
  const isTransformApplicable = (transform: Transform, node: ObjectNodeData): boolean => {
    // Check applicableTo first (declarative, more performant)
    const checkApplicableTo = (t: Transform) => t.applicableTo?.includes(node.type as any) ?? null;

    // Fall back to if check for advanced conditions
    const checkIf = (t: Transform) => t.if?.(node) ?? null;

    // Try applicableTo, then if, default to true if neither exists
    return maybe(checkApplicableTo, null)(transform) ?? maybe(checkIf, null)(transform) ?? true;
  };

  return {
    // addTransforms removed - use RegistryPlugin

    getAvailableTransforms(node: ObjectNodeData): Transform[] {
      return context.transforms.value.filter((t) => isTransformApplicable(t, node));
    },

    getTransformByName(name: string): Transform | undefined {
      // Use the computed map
      const matches = transformsByName.value.get(name);
      return matches ? matches[0] : undefined;
    },

    findTransform(name: string, node?: ObjectNodeData): Transform | undefined {
      // 🟢 OPTIMIZATION: Use Map lookup O(1) instead of Array.find O(n)
      const candidates = transformsByName.value.get(name);
      if (!candidates) return undefined;

      // If node is provided, filter by type compatibility
      if (node) {
        return candidates.find((t) => isTransformApplicable(t, node));
      }
      return candidates[0];
    },

    initParams(transform: Transform) {
      // Extract default VALUES from param configs
      return transform.params?.map((p) => p.default ?? null) || [];
    },

    createTransformEntry(name: string, node?: ObjectNodeData) {
      // 🟢 OPTIMIZATION: Use Map lookup O(1) instead of Array.find O(n)
      const candidates = transformsByName.value.get(name);
      if (!candidates) return null;

      // If node is provided, filter by type compatibility
      const transform = node
        ? candidates.find((t) => isTransformApplicable(t, node))
        : candidates[0];

      if (!transform) return null;

      // 🔥 DEEP CLONE: Create a completely new instance for each node
      // This prevents shared state between nodes (especially conditionMet)
      return {
        name: transform.name,
        applicableTo: transform.applicableTo ? [...transform.applicableTo] : undefined,
        params: transform.params?.map((p) => p.default ?? null) || [],
        fn: transform.fn,
        condition: transform.condition,
        structural: transform.structural,
        if: transform.if,
        // conditionMet will be set during evaluation, unique per node
      };
    },

    propagateTransform(node: ObjectNodeData) {
      const desk = context.deskRef?.();
      const propagate = createPropagateTransform(desk);
      propagate(node);
      triggerRef(context.tree); // Trigger reactivity after any transform change
    },

    computeStepValue,

    // 🟢 OPTIMIZATION: Expose map-based lookup for external use (e.g., applyRecipe)
    getTransformsByName(): Map<string, Transform[]> {
      return transformsByName.value;
    },
  };
}

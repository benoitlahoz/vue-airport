/**
 * Recipe Recorder - Delta-based operation recording
 *
 * Like Quill Delta, Excel Macros, or Git: we record operations AS THEY HAPPEN.
 * This is the ONLY reliable way to capture user intent.
 *
 * The tree is the source of truth for CURRENT STATE.
 * The recorder is the source of truth for HISTORY/CHANGES.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { Operation, Recipe, RecipeMetadata, Path } from './types';
import { RECIPE_VERSION } from './types';

export interface RecipeRecorder {
  /**
   * Current list of recorded operations (reactive)
   */
  operations: Ref<Operation[]>;

  /**
   * Record a transform operation
   * @deprecated Use recordSetTransforms instead
   */
  recordTransform(path: Path, transformName: string, params: any[]): void;

  /**
   * Record the complete transform state for a node
   * This replaces any previous transforms at this path
   */
  recordSetTransforms(
    path: Path,
    transforms: Array<{ name: string; params: any[]; isCondition?: boolean }>
  ): void;

  /**
   * Record a rename operation
   */
  recordRename(parentPath: Path, from: string, to: string): void;

  /**
   * Record a delete operation
   */
  recordDelete(path: Path): void;

  /**
   * Remove a delete operation (when restoring a soft deleted node)
   */
  removeDelete(path: Path): void;

  /**
   * Record an add operation
   */
  recordAdd(parentPath: Path, key: string, value: any): void;

  /**
   * Record an update operation (value change)
   */
  recordUpdate(path: Path, value: any): void;

  /**
   * Clear all recorded operations
   */
  clear(): void;

  /**
   * Build a recipe from recorded operations
   */
  build(requiredTransforms: string[], rootType: 'object' | 'array'): Recipe;

  /**
   * Get recipe as reactive computed
   */
  recipe: ComputedRef<Recipe>;

  /**
   * Get current operation count
   */
  count(): number;
}

/**
 * Create a recipe recorder
 *
 * This is the PRIMARY way to build recipes.
 * It records operations as they happen, ensuring perfect accuracy.
 */
export const createRecipeRecorder = (
  requiredTransforms: Ref<string[]>,
  rootType: Ref<'object' | 'array'>
): RecipeRecorder => {
  const operations = ref<Operation[]>([]);

  // Reactive recipe that updates when operations change
  const recipe = computed<Recipe>(() => {
    // Compute required transforms from actual recorded operations
    const transforms = new Set<string>();
    operations.value.forEach((op) => {
      if (op.type === 'transform') {
        transforms.add(op.transformName);
      } else if (op.type === 'setTransforms') {
        op.transforms.forEach((t) => transforms.add(t.name));
      } else if (op.type === 'applyConditions') {
        // 🆕 Extract transforms from conditions
        op.conditions.forEach((condition) => {
          condition.transforms.forEach((t) => transforms.add(t.name));
        });
      }
    });

    const metadata: RecipeMetadata = {
      createdAt: new Date().toISOString(),
      requiredTransforms: Array.from(transforms),
      rootType: rootType.value,
    };

    return {
      version: RECIPE_VERSION,
      operations: [...operations.value],
      metadata,
    };
  });

  return {
    operations,
    recipe,

    recordTransform(path: Path, transformName: string, params: any[]) {
      operations.value.push({
        type: 'transform',
        path: [...path],
        transformName,
        params: [...params],
      });
    },

    recordSetTransforms(
      path: Path,
      transforms: Array<{ name: string; params: any[]; isCondition?: boolean }>
    ) {
      // Remove any previous operations for this path (both setTransforms and applyConditions)
      const pathKey = path.join('.');
      operations.value = operations.value.filter((op) => {
        if (op.type !== 'setTransforms' && op.type !== 'applyConditions') return true;
        return op.path.join('.') !== pathKey;
      });

      // Only add new operation if there are transforms
      // If transforms is empty, we just removed the operation above (restoration to original)
      if (transforms.length > 0) {
        // 🆕 NEW ARCHITECTURE: Separate conditions from regular transforms
        // isCondition flag tells us which transforms are conditions

        const conditions: Array<{
          predicate?: { name: string; params: any[] };
          transforms: Array<{ name: string; params: any[] }>;
        }> = [];

        let currentCondition: { name: string; params: any[] } | undefined = undefined;
        let currentTransforms: Array<{ name: string; params: any[] }> = [];

        for (const t of transforms) {
          if (t.isCondition) {
            // This is a condition - save current group if any
            if (currentTransforms.length > 0) {
              conditions.push({
                predicate: currentCondition,
                transforms: [...currentTransforms],
              });
              currentTransforms = [];
            }
            // Start new condition group
            currentCondition = { name: t.name, params: [...t.params] };
          } else {
            // This is a regular transform
            currentTransforms.push({ name: t.name, params: [...t.params] });
          }
        }

        // Add final group
        if (currentTransforms.length > 0) {
          conditions.push({
            predicate: currentCondition,
            transforms: [...currentTransforms],
          });
        }

        // If no conditions array was created (no transforms), don't add operation
        if (conditions.length > 0) {
          operations.value.push({
            type: 'applyConditions',
            path: [...path],
            conditions,
          });
        }
      }
    },

    recordRename(parentPath: Path, from: string, to: string) {
      operations.value.push({
        type: 'rename',
        path: [...parentPath],
        from,
        to,
      });
    },

    recordDelete(path: Path) {
      operations.value.push({
        type: 'delete',
        path: [...path],
      });
    },

    removeDelete(path: Path) {
      // Remove the delete operation for this path when restoring a soft deleted node
      const pathKey = path.join('.');
      operations.value = operations.value.filter((op) => {
        if (op.type !== 'delete') return true;
        return op.path.join('.') !== pathKey;
      });
    },

    removeRename(parentPath: Path, from: string, to: string) {
      // Remove the rename operation when restoring an auto-renamed node
      const parentPathKey = parentPath.join('.');
      operations.value = operations.value.filter((op) => {
        if (op.type !== 'rename') return true;
        if (op.path.join('.') !== parentPathKey) return true;
        // Keep the operation if it doesn't match the from->to rename
        return !(op.from === from && op.to === to);
      });
    },

    updateDeletePath(oldPath: Path, newPath: Path) {
      // Update the path of a delete operation when a soft-deleted node is renamed
      const oldPathKey = oldPath.join('.');
      const deleteOp = operations.value.find(
        (op) => op.type === 'delete' && op.path.join('.') === oldPathKey
      );
      if (deleteOp && deleteOp.type === 'delete') {
        deleteOp.path = [...newPath];
      }
    },

    updateStructuralTransformRemoveSource(path: Path, removeSource: boolean) {
      // Find setTransforms or applyConditions operation for this path
      const pathKey = path.join('.');
      const transformOp = operations.value.find(
        (op) =>
          (op.type === 'setTransforms' || op.type === 'applyConditions') &&
          op.path.join('.') === pathKey
      );

      if (!transformOp) return;

      // Update removeSource in the last transform of the chain
      if (transformOp.type === 'setTransforms' && transformOp.transforms.length > 0) {
        const lastTransform = transformOp.transforms[transformOp.transforms.length - 1];
        if (lastTransform.params && lastTransform.params.length > 0) {
          // For structural transforms, removeSource is typically the last parameter
          const lastParam = lastTransform.params[lastTransform.params.length - 1];
          if (typeof lastParam === 'object' && 'removeSource' in lastParam) {
            lastParam.removeSource = removeSource;
          } else if (typeof lastParam === 'boolean') {
            // Direct boolean parameter
            lastTransform.params[lastTransform.params.length - 1] = removeSource;
          }
        }
      } else if (transformOp.type === 'applyConditions') {
        // Update in all condition branches
        transformOp.conditions.forEach((condition) => {
          if (condition.transforms.length > 0) {
            const lastTransform = condition.transforms[condition.transforms.length - 1];
            if (lastTransform.params && lastTransform.params.length > 0) {
              const lastParam = lastTransform.params[lastTransform.params.length - 1];
              if (typeof lastParam === 'object' && 'removeSource' in lastParam) {
                lastParam.removeSource = removeSource;
              } else if (typeof lastParam === 'boolean') {
                lastTransform.params[lastTransform.params.length - 1] = removeSource;
              }
            }
          }
        });
      }
    },

    recordAdd(parentPath: Path, key: string, value: any) {
      operations.value.push({
        type: 'add',
        path: [...parentPath],
        key,
        value,
      });
    },

    recordUpdate(path: Path, value: any) {
      // Remove any previous update operations for this exact path
      const pathKey = path.join('.');
      operations.value = operations.value.filter((op) => {
        if (op.type !== 'update') return true;
        return op.path.join('.') !== pathKey;
      });

      // Add new update operation
      operations.value.push({
        type: 'update',
        path: [...path],
        value,
      });
    },

    clear() {
      operations.value = [];
    },

    build(requiredTransforms: string[], rootType: 'object' | 'array'): Recipe {
      const metadata: RecipeMetadata = {
        createdAt: new Date().toISOString(),
        requiredTransforms,
        rootType,
      };

      return {
        version: RECIPE_VERSION,
        operations: [...operations.value],
        metadata,
      };
    },

    count() {
      return operations.value.length;
    },
  };
};

/**
 * Helper: Compute path from tree node
 *
 * Walks up the tree to build the full path from root to node
 * @param node - The node to compute path for
 * @param mode - Optional mode ('object' | 'model'). In model mode, skips numeric indices for template root.
 */
export const computePathFromNode = (node: any, mode?: 'object' | 'model'): Path => {
  const path: string[] = [];
  let current = node;

  // First pass: compute depth from root and collect ancestors
  const ancestors: any[] = [];
  let temp = node;
  while (temp && temp.parent) {
    ancestors.unshift(temp);
    if (!temp.parent.parent && (temp.parent.key === 'Object' || temp.parent.key === 'Array')) {
      break;
    }
    temp = temp.parent;
  }

  // Second pass: build path
  let currentDepth = 0;
  while (current && current.parent) {
    // In model mode, skip numeric indices ONLY if parent is the root Array (template mode)
    const parentIsRoot = !current.parent.parent && current.parent.key === 'Array';
    const isTemplateRootChild = mode === 'model' && parentIsRoot && /^\d+$/.test(current.key);

    if (current.key && !isTemplateRootChild) {
      path.unshift(current.key);
    }

    // Stop at root node (parent is Object/Array with no grandparent)
    if (
      !current.parent.parent &&
      (current.parent.key === 'Object' || current.parent.key === 'Array')
    ) {
      break;
    }

    current = current.parent;
    currentDepth++;
  }

  return path;
};

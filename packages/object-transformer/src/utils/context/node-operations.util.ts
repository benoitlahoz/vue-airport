import type { Ref } from 'vue';
import { triggerRef } from 'vue';
import type { ObjectNodeData } from '../../types';
import { handleRestoreConflict } from '../node/node-utilities.util';
import { computePathFromNode } from '../../recipe/recipe-recorder';
import { getKeyMetadata, getOriginalKey } from '../node/node-key-metadata.util';

export interface NodeOperationsContext {
  tree: Ref<ObjectNodeData>;
  propagateTransform: (node: ObjectNodeData) => void;
  deskRef?: () => any;
}

export function createNodeOperationsMethods(context: NodeOperationsContext) {
  return {
    getNode(id: string): ObjectNodeData | null {
      // Recursive search in the tree
      const findNode = (node: ObjectNodeData): ObjectNodeData | null => {
        if (node.id === id) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findNode(child);
            if (found) return found;
          }
        }
        return null;
      };
      return findNode(context.tree.value);
    },

    triggerTreeUpdate() {
      triggerRef(context.tree);
    },

    toggleNodeDeletion(node: ObjectNodeData) {
      const wasDeleted = node.deleted;
      node.deleted = !node.deleted;

      // 🟢 RECORD THE OPERATION (Delta-based recording)
      const desk = context.deskRef?.();
      if (desk?.recorder && node.parent) {
        const path = computePathFromNode(node, desk.mode?.value);

        if (!wasDeleted && node.deleted) {
          // Node was visible, now deleted → record delete
          desk.recorder.recordDelete(path);
        } else if (wasDeleted && !node.deleted) {
          // Node was deleted, now restored
          const metadata = getKeyMetadata(node);

          if (
            metadata.autoRenamed &&
            metadata.original &&
            node.key &&
            metadata.original !== node.key
          ) {
            // The node was auto-renamed while deleted (e.g., name → name_1)
            // The delete operation references the ORIGINAL key from source data
            const parentPath = computePathFromNode(node.parent, desk.mode?.value);
            const originalPath = [...parentPath, metadata.original];

            // Remove the delete operation for the original key
            desk.recorder.removeDelete(originalPath);

            // Check if there's now a conflict with the original key
            const conflictingNode = node.parent.children?.find(
              (c) => c !== node && c.key === metadata.original && !c.deleted
            );

            if (conflictingNode) {
              // There's a conflict - keep the auto-renamed key and record a rename operation
              // But first, check if the original node was removed by a structural transformation
              // If so, update that transformation to keep the source instead
              desk.recorder.updateStructuralTransformRemoveSource(originalPath, false);

              // Now record the rename from original to current key
              // IMPORTANT: Insert this rename BEFORE any existing rename that uses the original key as target
              // This ensures the execution order is: name → name_1, then name_object → name
              const existingRenameIndex = desk.recorder.operations.value.findIndex(
                (op: any) =>
                  op.type === 'rename' &&
                  op.path.join('.') === parentPath.join('.') &&
                  op.to === metadata.original
              );

              if (existingRenameIndex >= 0) {
                // Insert before the conflicting rename
                desk.recorder.operations.value.splice(existingRenameIndex, 0, {
                  type: 'rename' as const,
                  path: [...parentPath],
                  from: metadata.original!,
                  to: node.key!,
                });
              } else {
                // No conflicting rename found, add at the end
                desk.recorder.recordRename(parentPath, metadata.original!, node.key!);
              }
            } else {
              // No conflict - restore the original key
              node.key = metadata.original;
              metadata.autoRenamed = false;

              // Update any structural transformation to keep the source
              const originalPath = [...parentPath, metadata.original];
              desk.recorder.updateStructuralTransformRemoveSource(originalPath, false);

              // Check for conflicts with added properties now that we restored the original key
              if (node.parent) {
                handleRestoreConflict(node.parent, node);
              }
            }
          } else {
            // Normal restoration - remove the delete operation using current path
            desk.recorder.removeDelete(path);

            // Check for conflicts with added properties
            if (node.parent) {
              handleRestoreConflict(node.parent, node);
            }
          }
        }
      }

      // Note: handleRestoreConflict is now called conditionally above
      // We don't call it here anymore to avoid double-processing

      if (node.parent) {
        context.propagateTransform(node.parent);
      }

      triggerRef(context.tree); // Trigger reactivity
    },
  };
}

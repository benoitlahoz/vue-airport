import type { ObjectNodeData } from '..';

/**
 * Key editing state helpers
 */

export const shouldStartEdit = (
  node: ObjectNodeData,
  editingNode: ObjectNodeData | null
): boolean => {
  return editingNode === null;
};

export const canConfirmEdit = (
  tempKey: string | null,
  originalKey: string | undefined
): boolean => {
  return Boolean(tempKey?.trim()) && tempKey?.trim() !== originalKey;
};

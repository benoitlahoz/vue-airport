import type { ObjectNode, Transform, ObjectTransformerDesk } from '..';

/**
 * Transform filtering - Pure functions
 */

export const filterTransformsByType = (transforms: Transform[], nodeType: string): Transform[] => {
  return transforms.filter((t) => t.if({ type: nodeType } as ObjectNode));
};

/**
 * Transform actions - Side effects isolated
 */

export const applyNodeTransform = (
  node: ObjectNode,
  transformName: string | null,
  desk: ObjectTransformerDesk,
  currentSelection: string | null
): void => {
  if (!transformName || transformName === 'None') {
    node.transforms = [];
    if (node.parent) desk.propagateTransform(node.parent);
    return;
  }

  const shouldAdd = !currentSelection || currentSelection === '+';
  const shouldChange =
    currentSelection && currentSelection !== '+' && currentSelection !== transformName;

  if (!shouldAdd && !shouldChange) return;

  // Nettoyer les split nodes si nécessaire
  if (shouldChange && node.parent) {
    cleanupSplitNodes(node, node.parent);
  }

  const entry = desk.createTransformEntry(transformName, node);
  if (!entry) return;

  if (shouldAdd) {
    node.transforms.push(entry);
  } else {
    node.transforms = [entry];
  }

  desk.propagateTransform(node);
  if (node.parent) desk.propagateTransform(node.parent);
};

export const applyStepTransform = (
  node: ObjectNode,
  stepIndex: number,
  transformName: string | null,
  desk: ObjectTransformerDesk
): void => {
  if (!transformName) return;

  if (transformName === 'None') {
    node.transforms.splice(stepIndex + 1);
  } else {
    const entry = desk.createTransformEntry(transformName);
    if (entry) {
      node.transforms.splice(stepIndex + 1, 0, entry);
    }
  }

  desk.propagateTransform(node);
  if (node.parent) desk.propagateTransform(node.parent);
};

/**
 * Helper for split nodes cleanup
 */

const cleanupSplitNodes = (node: ObjectNode, parent: ObjectNode): void => {
  const baseKeyPrefix = (node.key || 'part') + '_';
  const hasSplitNodes = parent.children!.some(
    (child) => child !== node && child.key?.startsWith(baseKeyPrefix)
  );

  if (hasSplitNodes) {
    parent.children = parent.children!.filter(
      (child) => child === node || !child.key?.startsWith(baseKeyPrefix)
    );
  }
};

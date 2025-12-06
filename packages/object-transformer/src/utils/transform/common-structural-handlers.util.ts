import { registerStructuralTransformHandler } from './structural-transform-handlers.util';
import type { ObjectTransformerContext } from '../../types';

/**
 * Register common structural transform handlers
 * These handlers are shared across all primitive types
 * Call this function with the desk context to register handlers
 */
export const registerCommonStructuralHandlers = (desk?: ObjectTransformerContext): void => {
  // Generic toObject handler - works for all primitive types
  registerStructuralTransformHandler(
    'toObject',
    (current, lastKey, result) => {
      if (!result.object) return;

      // Create multiple properties from the object
      Object.entries(result.object).forEach(([key, value]) => {
        const newKey = `${lastKey}_${key}`;
        current[newKey] = value;
      });

      // Remove source if specified
      if (result.removeSource) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete current[lastKey];
      }
    },
    desk
  );

  // Conditional branch handler - creates _if and _else branches
  registerStructuralTransformHandler(
    'conditionalBranch',
    (current, lastKey, result) => {
      if (result.value === undefined) return;

      // Create two branches with the same value
      // They will diverge when different transforms are applied
      current[`${lastKey}_if`] = result.value;
      current[`${lastKey}_else`] = result.value;

      // Remove source if specified
      if (result.removeSource) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete current[lastKey];
      }
    },
    desk
  );
};

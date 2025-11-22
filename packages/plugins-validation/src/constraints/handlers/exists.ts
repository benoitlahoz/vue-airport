import type { ConstraintHandler } from '..';
import { ConstraintType } from '..';

export const existsHandler: ConstraintHandler = (constraint, data) => {
  if (constraint.type !== ConstraintType.Exists) return null;
  const key = constraint.key;
  const source = constraint.source;
  if (!source.includes(data[key])) {
    return constraint.message || `Reference for ${String(key)} does not exist.`;
  }
  return null;
};

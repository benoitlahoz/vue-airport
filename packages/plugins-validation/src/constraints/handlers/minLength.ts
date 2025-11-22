import type { ConstraintHandler } from '..';
import { ConstraintType } from '..';

export const minLengthHandler: ConstraintHandler = (constraint, data) => {
  if (constraint.type !== ConstraintType.MinLength) return null;
  const key = constraint.key;
  const length = constraint.length;
  if (typeof data[key] === 'string' && data[key].length < length) {
    return constraint.message || `Field ${String(key)} must be at least ${length} characters.`;
  }
  return null;
};

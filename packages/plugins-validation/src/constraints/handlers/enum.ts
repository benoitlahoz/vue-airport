import type { ConstraintHandler } from '..';
import { ConstraintType } from '..';

export const enumHandler: ConstraintHandler = (constraint, data) => {
  if (constraint.type !== ConstraintType.Enum) return null;
  const key = constraint.key;
  const values = constraint.values;
  if (!values.includes(data[key])) {
    return constraint.message || `Field ${String(key)} must be one of: ${values.join(', ')}.`;
  }
  return null;
};

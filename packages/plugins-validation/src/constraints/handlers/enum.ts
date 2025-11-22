import type { ConstraintHandler } from '..';

export const enumHandler: ConstraintHandler = (constraint, data) => {
  const key = (constraint as { key: string | number }).key;
  const values = (constraint as { values: any[] }).values;
  if (!values.includes(data[key])) {
    return constraint.message || `Field ${String(key)} must be one of: ${values.join(', ')}.`;
  }
  return null;
};

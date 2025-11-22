import type { ConstraintHandler } from '..';

export const rangeHandler: ConstraintHandler = (constraint, data) => {
  const key = (constraint as { key: string | number }).key;
  const min = (constraint as { min: number }).min;
  const max = (constraint as { max: number }).max;
  const value = data[key];
  if (typeof value === 'number' && (value < min || value > max)) {
    return constraint.message || `Value for ${String(key)} must be between ${min} and ${max}.`;
  }
  return null;
};

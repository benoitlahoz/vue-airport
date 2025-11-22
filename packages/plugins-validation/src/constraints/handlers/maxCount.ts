import type { ConstraintHandler } from '..';

export const maxCountHandler: ConstraintHandler = (constraint, _data, children) => {
  if ('count' in constraint) {
    const count = constraint.count;
    if (children.length >= count) {
      return constraint.message || `Maximum count of ${count} exceeded`;
    }
  }
  return null;
};

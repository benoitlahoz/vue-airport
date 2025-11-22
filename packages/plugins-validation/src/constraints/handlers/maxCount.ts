import type { ConstraintHandler } from '..';

export const maxCountHandler: ConstraintHandler = (constraint, _data, children) => {
  const count = (constraint as { count: number }).count;
  if (children.length >= count) {
    return constraint.message || `Maximum count of ${count} exceeded`;
  }
  return null;
};

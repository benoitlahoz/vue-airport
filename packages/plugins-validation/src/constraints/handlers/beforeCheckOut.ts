import type { ConstraintHandler } from '..';

export const beforeCheckOutHandler: ConstraintHandler = (constraint, data, children) => {
  const rule = (constraint as { rule?: Function }).rule;
  if (!rule) return null;
  const result = rule(data, children);
  return typeof result === 'string' && result ? constraint.message || result : null;
};

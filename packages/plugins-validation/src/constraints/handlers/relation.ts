import type { ConstraintHandler } from '..';

export const relationHandler: ConstraintHandler = (constraint, data, children) => {
  const rule = (constraint as { rule?: Function }).rule;
  if (rule) {
    const result = rule(data, children);
    return typeof result === 'string' && result ? constraint.message || result : null;
  }
  return null;
};

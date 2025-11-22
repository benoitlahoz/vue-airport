import type { ConstraintHandler } from '..';

export const customHandler: ConstraintHandler = async (constraint, data, children) => {
  const fn = (constraint as { fn: Function }).fn;
  const result = fn(data, children);
  const resolved = result instanceof Promise ? await result : result;
  return typeof resolved === 'string' && resolved ? constraint.message || resolved : null;
};

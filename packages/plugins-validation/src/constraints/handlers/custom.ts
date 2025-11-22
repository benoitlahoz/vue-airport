import type { ConstraintHandler } from '..';

export const customHandler: ConstraintHandler = async (constraint, data, children) => {
  if ('fn' in constraint && typeof constraint.fn === 'function') {
    const result = constraint.fn(data, children);
    const resolved = result instanceof Promise ? await result : result;
    return typeof resolved === 'string' && resolved ? constraint.message || resolved : null;
  }
  return null;
};

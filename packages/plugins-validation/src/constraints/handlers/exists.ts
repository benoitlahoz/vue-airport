import type { ConstraintHandler } from '..';

export const existsHandler: ConstraintHandler = (constraint, data) => {
  const key = (constraint as { key: string | number }).key;
  const source = (constraint as { source: any[] }).source;
  if (!source.includes(data[key])) {
    return constraint.message || `Reference for ${String(key)} does not exist.`;
  }
  return null;
};

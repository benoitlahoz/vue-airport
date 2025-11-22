import type { ConstraintHandler } from '..';

export const dependencyHandler: ConstraintHandler = (constraint, data) => {
  const key = (constraint as { key: string | number }).key;
  const value = (constraint as { value: any }).value;
  const required = (constraint as { required: string | number }).required;
  if (
    data[key] === value &&
    (data[required] === undefined || data[required] === null || data[required] === '')
  ) {
    return (
      constraint.message || `Field ${String(required)} is required when ${String(key)} is ${value}.`
    );
  }
  return null;
};

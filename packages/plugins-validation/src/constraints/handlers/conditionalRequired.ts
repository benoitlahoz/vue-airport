import type { ConstraintHandler } from '..';

export const conditionalRequiredHandler: ConstraintHandler = (constraint, data) => {
  const key = (constraint as { key: string | number }).key;
  const conditionKey = (constraint as { conditionKey: string | number }).conditionKey;
  const conditionValue = (constraint as { conditionValue: any }).conditionValue;
  if (
    data[conditionKey] === conditionValue &&
    (data[key] === undefined || data[key] === null || data[key] === '')
  ) {
    return (
      constraint.message ||
      `Field ${String(key)} is required when ${String(conditionKey)} is ${conditionValue}.`
    );
  }
  return null;
};

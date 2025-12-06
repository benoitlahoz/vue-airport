import type { Ref } from 'vue';
import type { Condition } from '../../types';

export interface ConditionOperationsContext {
  conditions: Ref<Condition[]>;
}

/**
 * Create condition management methods
 */
export function createConditionOperationsMethods(context: ConditionOperationsContext) {
  const { conditions } = context;

  return {
    // addConditions removed - use RegistryPlugin

    /**
     * Get a condition by name
     */
    getCondition(name: string): Condition | undefined {
      return conditions.value.find((c) => c.name === name);
    },
  };
}

/**
 * Minimal type for a registration plugin (CheckInPlugin)
 * Replace with core import if available
 */
export type CheckInPlugin<T = any> = (ctx: PluginContext<T>) => {
  validate: (child: T, children: T[]) => string[];
};

/**
 * Minimal context for plugin integration (should be typed with core if available)
 */
export interface PluginContext<T = any> {
  onBeforeCheckIn: (fn: (child: T, children: T[]) => void) => void;
  onBeforeCheckOut?: (fn: (child: T, children: T[]) => void) => void;
}

/**
 * Custom constraint function
 */
export type ConstraintFn<T = any> = (child: T, children: T[]) => string | null;

/**
 * Declarative constraint object
 */
export type ConstraintObj<T = any> =
  | { type: 'unique'; key: keyof T; message?: string }
  | { type: 'maxCount'; count: number; message?: string }
  | { type: 'relation'; rule: ConstraintFn<T>; message?: string }
  | { type: 'beforeCheckOut'; rule: ConstraintFn<T>; message?: string };

/**
 * Constraint (function or object)
 */
export type Constraint<T = any> = ConstraintFn<T> | ConstraintObj<T>;

/**
 * Constraint-based validation plugin for VueAirport
 * Allows you to enforce business rules on registered data and relationships (uniqueness, cardinality, dependencies, etc.)
 *
 * @template T Type of registered children
 * @param constraints Array of constraints (functions or objects)
 * @returns Registration plugin compatible with VueAirport
 *
 * @example
 * import { useCheckIn } from 'vue-airport/core'
 * import { createConstraintsPlugin } from '@vue-airport/plugins-validation'
 *
 * const constraints = [
 *   { type: 'unique', key: 'email', message: 'Email already used' },
 *   { type: 'maxCount', count: 5, message: 'Max 5 items' },
 *   (child, children) => child.role === 'admin' && children.filter(u => u.role === 'admin').length >= 2 ? 'Maximum 2 admins' : null,
 * ]
 *
 * const { children } = useCheckIn({
 *   plugins: [createConstraintsPlugin(constraints)]
 * })
 */
export function createConstraintsPlugin<T = any>(constraints: Constraint<T>[]): CheckInPlugin<T> {
  return (ctx: PluginContext<T>) => {
    /**
     * Validates a child and returns the list of errors
     */
    function validate(child: T, children: T[]): string[] {
      const errors: string[] = [];
      for (const constraint of constraints) {
        if (typeof constraint === 'function') {
          const result = constraint(child, children);
          if (typeof result === 'string' && result) errors.push(result);
        } else if (constraint.type === 'unique') {
          if (children.some((c) => c[constraint.key] === child[constraint.key])) {
            errors.push(constraint.message || `Duplicate value for ${String(constraint.key)}`);
          }
        } else if (constraint.type === 'maxCount') {
          if (children.length >= constraint.count) {
            errors.push(constraint.message || `Maximum count of ${constraint.count} exceeded`);
          }
        } else if (constraint.type === 'relation' && constraint.rule) {
          const result = constraint.rule(child, children);
          if (typeof result === 'string' && result) errors.push(constraint.message || result);
        }
        // beforeCheckOut constraints are handled in the dedicated hook
      }
      return errors;
    }

    ctx.onBeforeCheckIn((child: T, children: T[]) => {
      const errors = validate(child, children);
      if (errors.length) throw new Error(errors.join(', '));
    });

    if (ctx.onBeforeCheckOut) {
      ctx.onBeforeCheckOut((child: T, children: T[]) => {
        for (const constraint of constraints) {
          if (
            typeof constraint !== 'function' &&
            constraint.type === 'beforeCheckOut' &&
            constraint.rule
          ) {
            const result = constraint.rule(child, children);
            if (typeof result === 'string' && result) throw new Error(constraint.message || result);
          }
        }
      });
    }

    return { validate };
  };
}

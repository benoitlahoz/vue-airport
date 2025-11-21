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
// Remplacement complet de la fonction pour desk-compliance
import { ref } from 'vue';

// Types déjà présents dans le fichier
export type ConstraintFn<T = any> = (child: T, children: T[]) => string | null;
export type ConstraintObj<T = any> =
  | { type: 'unique'; key: keyof T; message?: string }
  | { type: 'maxCount'; count: number; message?: string }
  | { type: 'relation'; rule: ConstraintFn<T>; message?: string }
  | { type: 'beforeCheckOut'; rule: ConstraintFn<T>; message?: string };
export type Constraint<T = any> = ConstraintFn<T> | ConstraintObj<T>;

export interface ConstraintError {
  id: string | number;
  errors: string[];
  timestamp: number;
}

export function createConstraintsPlugin<T extends Record<string, any> = any>(
  constraints: Constraint<T>[]
): any {
  const constraintErrors = ref<ConstraintError[]>([]);

  const addError = (id: string | number, errors: string[]) => {
    constraintErrors.value.push({ id, errors, timestamp: Date.now() });
  };
  const removeErrorsForId = (id: string | number) => {
    constraintErrors.value = constraintErrors.value.filter((e) => e.id !== id);
  };

  function validateData(id: string | number, data: T, children: T[]): boolean {
    removeErrorsForId(id);
    const errors: string[] = [];
    for (const constraint of constraints) {
      if (typeof constraint === 'function') {
        const result = constraint(data, children);
        if (typeof result === 'string' && result) errors.push(result);
      } else if (constraint.type === 'unique') {
        if (children.some((c: T) => c[constraint.key] === data[constraint.key])) {
          errors.push(constraint.message || `Duplicate value for ${String(constraint.key)}`);
        }
      } else if (constraint.type === 'maxCount') {
        if (children.length >= constraint.count) {
          errors.push(constraint.message || `Maximum count of ${constraint.count} exceeded`);
        }
      } else if (constraint.type === 'relation' && constraint.rule) {
        const result = constraint.rule(data, children);
        if (typeof result === 'string' && result) errors.push(constraint.message || result);
      }
      // beforeCheckOut constraints sont gérées dans le hook dédié
    }
    if (errors.length) {
      addError(id, errors);
      return false;
    }
    return true;
  }

  let deskInstance: any = null;

  return {
    name: 'constraints',
    version: '1.0.0',

    install: (desk: any) => {
      deskInstance = desk;
      return () => {
        constraintErrors.value = [];
        deskInstance = null;
      };
    },

    onBeforeCheckIn: (id: string | number, data: T): boolean => {
      const children = deskInstance?.getAll ? deskInstance.getAll() : [];
      return validateData(
        id,
        data,
        children.map((c: any) => c.data)
      );
    },

    onBeforeCheckOut: (id: string | number): boolean => {
      removeErrorsForId(id);
      return true;
    },

    methods: {
      getConstraintErrors: () => constraintErrors.value,
      getConstraintErrorsById: (_desk: any, id: string | number) =>
        constraintErrors.value.find((e) => e.id === id)?.errors ?? [],
      clearConstraintErrors: () => {
        constraintErrors.value = [];
      },
    },

    computed: {
      constraintErrorCount: () => constraintErrors.value.length,
      hasConstraintErrors: () => constraintErrors.value.length > 0,
    },
  };
}

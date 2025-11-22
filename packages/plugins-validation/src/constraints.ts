import { ref } from 'vue';
import type { CheckInPlugin } from 'vue-airport';

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
): CheckInPlugin<T> {
  const constraintErrors = ref<ConstraintError[]>([]);

  const addErrors = (id: string | number, errors: string[]) => {
    constraintErrors.value.push({ id, errors, timestamp: Date.now() });
  };
  const removeErrorsForId = (id: string | number) => {
    constraintErrors.value = constraintErrors.value.filter((e) => e.id !== id);
  };

  const emitToDevTools = (action: string, id: string | number, errors: string[]) => {
    if (deskInstance && deskInstance.devTools && deskInstance.__deskId) {
      deskInstance.devTools.emit({
        type: 'plugin-execute',
        timestamp: Date.now(),
        deskId: deskInstance.__deskId,
        childId: id,
        pluginName: 'constraints',
        data: {
          action,
          errorCount: errors.length,
          hasErrors: errors.length > 0,
          errors,
        },
      });
    }
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

      // beforeCheckOut constraints are validated in the dedicated hook
    }
    if (errors.length) {
      addErrors(id, errors);
      emitToDevTools('validate-check-in', id, errors);
      return false;
    }
    emitToDevTools('validate-check-in', id, []);
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
      const children = deskInstance?.getAll ? deskInstance.getAll() : [];
      const item = children.find((c: any) => c.id === id)?.data;
      const errors: string[] = [];
      for (const constraint of constraints) {
        if (
          typeof constraint !== 'function' &&
          constraint.type === 'beforeCheckOut' &&
          constraint.rule
        ) {
          const result = constraint.rule(
            item,
            children.map((c: any) => c.data)
          );
          if (typeof result === 'string' && result) {
            errors.push(constraint.message || result);
          }
        }
      }
      removeErrorsForId(id);
      if (errors.length) {
        addErrors(id, errors);
        emitToDevTools('validate-check-out', id, errors);
        return false;
      }
      emitToDevTools('validate-check-out', id, []);
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

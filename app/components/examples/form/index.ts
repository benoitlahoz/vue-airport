import type { InjectionKey, Ref } from 'vue';
import type { DeskCore } from '#vue-airport/composables/useCheckIn';
import type { ValidationError } from '@vue-airport/plugins-base';

export interface FieldData {
  id: string;
  label: string;
  value: string | number;
  type: 'text' | 'email' | 'number';
  required?: boolean;
  touched?: boolean;
  error?: ValidationError;
}

export interface FormContext {
  fieldData: Ref<FieldData[]>;
  errorById: (id: string) => ValidationError | undefined;
}

export const FORM_DESK_KEY: InjectionKey<DeskCore<FieldData> & FormContext> = Symbol('formDesk');

export { default as Form } from './Form.vue';
export { default as FormField } from './FormField.vue';

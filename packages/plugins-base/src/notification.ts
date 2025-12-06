import { ref } from 'vue';
import type { CheckInPlugin, CheckInPluginMethods, DeskCore } from 'vue-airport';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Notification {
  id: string;
  code?: string;
  message: string;
  details?: any;
  severity: NotificationSeverity;
  timestamp: number;
  [key: string]: any;
}

export interface NotificationPluginMethods<T> extends CheckInPluginMethods<T> {
  notify: (payload: Partial<Notification>) => void;
  dismiss: (id: string) => void;
  clearErrors: () => void;
  getErrors: () => Notification[];
}

export interface NotificationPlugin<T> extends CheckInPlugin<T, NotificationPluginMethods<T>> {
  methods: NotificationPluginMethods<T>;
}

export const createNotificationPlugin = <T = unknown>(): NotificationPlugin<T> => {
  const errors = ref<Notification[]>([]);

  const dismiss = (id: string) => {
    errors.value = errors.value.filter((e) => e.id !== id);
  };

  const notify = (payload: Partial<Notification>) => {
    const id = crypto.randomUUID();
    const error: Notification = {
      id,
      timestamp: Date.now(),
      severity: 'error',
      message: 'An unknown error occurred',
      ...payload,
    };
    errors.value.push(error);

    // Auto-dismiss for info/warning
    if (error.severity === 'info' || error.severity === 'warning') {
      setTimeout(() => dismiss(id), 5000);
    }
  };

  const clearErrors = () => {
    errors.value = [];
  };

  const getErrors = () => errors.value;

  return {
    name: 'notification',
    version: '1.0.0',
    install: (desk: DeskCore<T>) => {
      // Extend desk with notification methods
      (desk as any).errors = errors;
      (desk as any).notify = notify;
      (desk as any).dismiss = dismiss;
      (desk as any).clearErrors = clearErrors;
      (desk as any).getErrors = getErrors;

      return () => {
        errors.value = [];
      };
    },
    methods: {
      notify,
      dismiss,
      clearErrors,
      getErrors,
    },
  };
};

import type { InjectionKey } from 'vue';

export const DASHBOARD_DESK_KEY = Symbol('dashboard-desk') as InjectionKey<any>;

export interface MetricWidget {
  id: string;
  type: 'metric' | 'chart' | 'activity' | 'notification';
  title: string;
  value?: number | string;
  previousValue?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  data?: Array<{ label: string; value: number }>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
  description?: string;
  icon?: string;
  category?: string;
}

export interface DashboardState {
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  serverLoad: number;
  alerts: number;
}

export { default as AnalyticsDashboard } from './AnalyticsDashboard.vue';
export { default as MetricWidget } from './MetricWidget.vue';
export { default as ChartWidget } from './ChartWidget.vue';
export { default as ActivityWidget } from './ActivityWidget.vue';
export { default as NotificationWidget } from './NotificationWidget.vue';

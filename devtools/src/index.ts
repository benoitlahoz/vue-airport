import type { App } from 'vue';
import { setupDevtoolsPlugin } from '@vue/devtools-api';
import { PLUGIN_ID } from './constants';
import { setupTimeline } from './timeline';
import { setupInspector } from './inspector';
import { attachGlobalHook } from './hook';

export interface CheckInDevToolsOptions {
  /**
   * Enable performance tracking
   * @default true
   */
  enablePerformance?: boolean;

  /**
   * Enable timeline events
   * @default true
   */
  enableTimeline?: boolean;

  /**
   * Enable registry inspector
   * @default true
   */
  enableInspector?: boolean;
}

/**
 * Setup vue-checkin DevTools integration
 */
export function setupCheckInDevTools(app: App, options: CheckInDevToolsOptions = {}) {
  const { enableTimeline = true, enableInspector = true } = options;

  // Attach global hook for tracking
  attachGlobalHook(app);

  setupDevtoolsPlugin(
    {
      id: PLUGIN_ID,
      label: 'CheckIn',
      packageName: 'vue-checkin',
      homepage: 'https://github.com/benoitlahoz/vue-checkin',
      logo: 'https://raw.githubusercontent.com/benoitlahoz/vue-checkin/master/logo.svg',
      app: app as any,
      enableEarlyProxy: true,
    },
    (api: any) => {
      // Setup timeline layer
      if (enableTimeline) {
        setupTimeline(api);
      }

      // Setup registry inspector
      if (enableInspector) {
        setupInspector(api);
      }

      // Add custom tabs (future)
      // setupCustomTabs(api)
    }
  );
}

export * from './types';

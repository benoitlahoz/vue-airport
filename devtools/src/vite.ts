import type { Plugin } from 'vite';

export interface VitePluginOptions {
  /**
   * Enable in production
   * @default false
   */
  productionEnabled?: boolean;
}

/**
 * Vite plugin for vue-checkin DevTools
 */
export function VueCheckInDevTools(options: VitePluginOptions = {}): Plugin {
  const { productionEnabled = false } = options;

  return {
    name: 'vue-checkin-devtools',
    enforce: 'pre',

    config(config, { mode }) {
      // Skip in production unless explicitly enabled
      if (mode === 'production' && !productionEnabled) {
        return;
      }

      return {
        optimizeDeps: {
          include: ['vue-checkin-devtools', '@vue/devtools-api'],
        },
      };
    },

    transform(code, id) {
      // Auto-inject DevTools setup in main entry
      if (id.includes('main.ts') || id.includes('main.js')) {
        const injection = `
import { setupCheckInDevTools } from 'vue-checkin-devtools'

const __originalCreateApp = createApp
const createApp = (...args) => {
  const app = __originalCreateApp(...args)
  if (import.meta.env.DEV) {
    setupCheckInDevTools(app)
  }
  return app
}
`;
        return {
          code: injection + code,
          map: null,
        };
      }
    },
  };
}

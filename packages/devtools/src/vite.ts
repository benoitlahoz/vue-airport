import type { Plugin } from 'vite';

export interface VitePluginOptions {
  /**
   * Enable in production
   * @default false
   */
  productionEnabled?: boolean;

  /**
   * Auto-inject DevTools in app entry
   * Set to false for Nuxt projects (use the Nuxt plugin instead)
   * @default true
   */
  autoInject?: boolean;
}

/**
 * Vite plugin for vue-airport DevTools
 * For Nuxt projects, set autoInject: false and use the Nuxt plugin instead
 */
export function VueAirportDevTools(options: VitePluginOptions = {}): Plugin {
  const { productionEnabled = false, autoInject = true } = options;

  return {
    name: 'vue-airport-devtools',
    enforce: 'pre',

    config(config, { mode }) {
      // Skip in production unless explicitly enabled
      if (mode === 'production' && !productionEnabled) {
        return;
      }

      return {
        optimizeDeps: {
          include: ['vue-airport-devtools', '@vue/devtools-api'],
        },
      };
    },

    transform(code, _id) {
      // Skip auto-injection if disabled (e.g., for Nuxt)
      if (!autoInject) {
        return;
      }

      // Auto-inject DevTools setup in app entry files.
      // Instead of relying on a fixed filename, detect files that import or
      // call Vue entry helpers (createApp / createSSRApp / hydrateApp).
      const looksLikeVueEntry =
        /import\s+\{[^}]*\b(createApp|createSSRApp|hydrateApp)\b[^}]*\}\s+from\s+['"]vue['"]/m.test(
          code
        ) ||
        (/from\s+['"]vue['"]/m.test(code) &&
          /\b(createApp|createSSRApp|hydrateApp)\s*\(/m.test(code)) ||
        /\b(createApp|createSSRApp|hydrateApp)\s*\(/m.test(code);

      if (looksLikeVueEntry) {
        const injection = `
import { setupAirportDevTools } from 'vue-airport-devtools';

(function() {
  // Wrap app creation helpers to attach the DevTools in client dev mode.
  const shouldAttach = () => typeof window !== 'undefined' && !import.meta.env.SSR && import.meta.env.DEV;

  try {
    if (typeof createApp !== 'undefined') {
      const __originalCreateApp = createApp;
      createApp = (...args) => {
        const app = __originalCreateApp(...args);
        if (shouldAttach()) {
          setupAirportDevTools(app);
        }
        return app;
      };
    }

    if (typeof createSSRApp !== 'undefined') {
      const __originalCreateSSRApp = createSSRApp;
      createSSRApp = (...args) => {
        const app = __originalCreateSSRApp(...args);
        if (shouldAttach()) {
          setupAirportDevTools(app);
        }
        return app;
      };
    }

    if (typeof hydrateApp !== 'undefined') {
      const __originalHydrateApp = hydrateApp;
      hydrateApp = (...args) => {
        const app = __originalHydrateApp(...args);
        if (shouldAttach()) {
          setupAirportDevTools(app);
        }
        return app;
      };
    }
  } catch {
    // best-effort only; if wrapping fails, do nothing
    console.warn('[vue-airport-devtools] Failed to auto-inject DevTools setup.');
  }
})();
`;

        // Prefer to alias named imports from 'vue' so we can provide local
        // wrapper functions. If we can't detect a named import, fall back to
        // the previous best-effort injection.
        try {
          const vueImportRegex = /import\s+([^;]+)\s+from\s+['"]vue['"];?/m;
          const vueImportMatch = code.match(vueImportRegex);
          let newCode: string;

          if (vueImportMatch && vueImportMatch[1]) {
            const spec = vueImportMatch[1].trim();

            // Handle named imports like: import { createApp, foo } from 'vue'
            if (/^{[\s\S]*}$/.test(spec)) {
              // Replace occurrences of the target helpers with aliased imports
              const aliasedSpec = spec.replace(
                /\b(createApp|createSSRApp|hydrateApp)\b/g,
                (m) => `${m} as __original_${m}`
              );
              const newImport = `import ${aliasedSpec} from 'vue';`;
              // Replace the original import with the aliased one
              newCode = code.replace(vueImportRegex, newImport);

              // Build wrapper code that uses the aliased originals
              const wrappers = `
import { setupAirportDevTools } from 'vue-airport-devtools';

const __shouldAttach = () => typeof window !== 'undefined' && !import.meta.env.SSR && import.meta.env.DEV;
let createApp = undefined;
let createSSRApp = undefined;
let hydrateApp = undefined;
try {
  ${spec.includes('createApp') ? `createApp = (...args) => { const app = __original_createApp(...args); if (__shouldAttach()) { setupAirportDevTools(app); } return app; };` : ''}
  ${spec.includes('createSSRApp') ? `createSSRApp = (...args) => { const app = __original_createSSRApp(...args); if (__shouldAttach()) { setupAirportDevTools(app); } return app; };` : ''}
  ${spec.includes('hydrateApp') ? `hydrateApp = (...args) => { const app = __original_hydrateApp(...args); if (__shouldAttach()) { setupAirportDevTools(app); } return app; };` : ''}
} catch {
  // best-effort only; if wrapping fails, do nothing
  console.warn('[vue-airport-devtools] Failed to auto-inject DevTools setup. import.meta.env.DEV:', import.meta.env.DEV);
  ${spec.includes('createApp') ? `createApp = __original_createApp;` : ''}
  ${spec.includes('createSSRApp') ? `createSSRApp = __original_createSSRApp;` : ''}
  ${spec.includes('hydrateApp') ? `hydrateApp = __original_hydrateApp;` : ''}
}
`;

              // Insert wrappers after the (now modified) import
              const importMatch = newCode.match(vueImportRegex)![0];
              const insertPos = newCode.indexOf(importMatch) + importMatch.length;
              newCode = newCode.slice(0, insertPos) + '\n' + wrappers + newCode.slice(insertPos);
            } else {
              // Non-named imports (default or namespace) are harder to patch safely.
              // Fallback to injecting the previously computed `injection` after
              // the import statement so we still try to attach where possible.
              const match = vueImportMatch[0];
              const insertPos = code.indexOf(match) + match.length;
              newCode = code.slice(0, insertPos) + '\n' + injection + code.slice(insertPos);
            }
          } else {
            const importRegex = /^import .*;$/gm;
            const imports = code.match(importRegex);
            if (imports && imports.length) {
              const lastImport = imports[imports.length - 1];
              const insertPos = code.indexOf(lastImport) + lastImport.length;
              newCode = code.slice(0, insertPos) + '\n' + injection + code.slice(insertPos);
            } else {
              newCode = injection + code;
            }
          }

          return {
            code: newCode,
            map: null,
          };
        } catch {
          return {
            code: injection + code,
            map: null,
          };
        }
      }
    },
  };
}

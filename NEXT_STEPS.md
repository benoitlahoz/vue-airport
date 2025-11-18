# 🎯 Prochaines Étapes - Vue Airport Monorepo

## ✅ Complété

- [x] Migration vers structure monorepo
- [x] Configuration Turborepo + Yarn Workspaces
- [x] Séparation `vue-airport` et `@vue-airport/plugins`
- [x] Build fonctionnelle avec cache
- [x] Documentation intacte

## 🔧 Corrections Immédiates

### 1. Fixer les Warnings TypeScript dans @vue-airport/plugins

**Problème :** Les plugins ne trouvent pas `vue-airport` pendant la compilation TypeScript.

**Solution :**
```json
// packages/plugins/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "vue-airport": ["../core/src"]
    }
  }
}
```

### 2. Wrapper le Plugin Nuxt DevTools

**Fichier :** `packages/devtools/src/nuxt.ts`

```typescript
import { defineNuxtPlugin } from '#app';
import { setupAirportDevTools } from './index';

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== 'undefined') {
    setupAirportDevTools(nuxtApp.vueApp);
  }
});
```

## 📦 Nouveaux Packages à Créer

### Phase 1 - Priorité Haute (WebRTC/Médias)

#### @vue-airport/plugins-media
```bash
packages/plugins-media/
├── src/
│   ├── webrtc.ts          # createWebRTCPlugin
│   ├── stream.ts          # createStreamPlugin
│   ├── peer.ts            # createPeerPlugin
│   ├── recording.ts       # createRecordingPlugin
│   └── index.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Dependencies :**
- `vue-airport`: `workspace:*`
- Peer: `vue: ^3.0.0`

#### @vue-airport/plugins-social
```bash
packages/plugins-social/
├── src/
│   ├── presence.ts        # createPresencePlugin
│   ├── typing.ts          # createTypingIndicatorPlugin
│   ├── reactions.ts       # createReactionsPlugin
│   ├── notifications.ts   # createNotificationsPlugin
│   └── index.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Phase 2 - Priorité Moyenne (Collaboration)

#### @vue-airport/plugins-collaboration
```bash
packages/plugins-collaboration/
├── src/
│   ├── crdt.ts           # createCRDTPlugin
│   ├── cursors.ts        # createCursorsPlugin
│   ├── co-editing.ts     # createCoEditingPlugin
│   ├── awareness.ts      # createAwarenessPlugin
│   └── index.ts
```

### Phase 3 - Performance & Utilitaires

#### @vue-airport/plugins-performance
```bash
packages/plugins-performance/
├── src/
│   ├── virtual-scroll.ts  # createVirtualScrollPlugin
│   ├── lazy.ts           # createLazyPlugin
│   ├── batch.ts          # createBatchPlugin
│   └── index.ts
```

## 🚀 Améliorations Techniques

### 1. Tests Unitaires
Ajouter Jest/Vitest dans chaque package :
```json
// packages/*/package.json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run"
  }
}
```

### 2. Linting par Package
```json
// turbo.json
{
  "tasks": {
    "lint": {
      "cache": true
    }
  }
}
```

### 3. Versioning Automatique
Utiliser **Changesets** pour gérer les versions :
```bash
yarn add -D -W @changesets/cli
yarn changeset init
```

### 4. CI/CD GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: yarn build
      - run: yarn test
```

## 📚 Documentation

### 1. Exemples par Package
Créer `packages/*/examples/` avec des exemples d'utilisation.

### 2. API Reference
Générer automatiquement avec **TypeDoc** :
```bash
yarn add -D -W typedoc
```

### 3. Storybook (optionnel)
Pour tester visuellement les plugins :
```bash
packages/storybook/
```

## 🎯 Migration des Utilisateurs

### 1. Guide de Migration
- [x] Créé : `MIGRATION_MONOREPO.md`

### 2. Backward Compatibility Package
Créer `vue-airport` (legacy) qui réexporte tout :
```typescript
// packages/vue-airport/src/index.ts
export * from 'vue-airport';
export * from '@vue-airport/plugins';
```

### 3. Annonce
- [ ] GitHub Release avec notes de migration
- [ ] Update README.md
- [ ] Update documentation website

## 📈 Métriques à Suivre

- Bundle size par package
- Build time avec Turbo cache
- Download stats npm
- GitHub stars/forks

## 🎓 Ressources Utiles

- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Yarn Workspaces Best Practices](https://yarnpkg.com/features/workspaces)
- [Changesets Documentation](https://github.com/changesets/changesets)

## ✨ Opportunités

### 1. Templates de Démarrage
Créer des templates pour différents cas d'usage :
- `create-vue-airport-app`
- Templates : WebRTC, Social, Collaboration

### 2. Plugins Premium/Community
Ouvrir un repo `vue-airport-plugins-community` pour contributions externes.

### 3. Intégrations
- Nuxt Module complet
- Vite Plugin
- Vue CLI Plugin
- Astro Integration

---

**Prochaine session :** Commencer par fixer les warnings TypeScript et créer `@vue-airport/plugins-media` ?

# Migration vers Monorepo - Guide

## 📦 Nouvelle Structure

Vue Airport a été migré vers une architecture monorepo utilisant **Turborepo** et **Yarn Workspaces**.

### Avant (Structure Simple)
```
vue-airport/
├── lib/              # Package unique
├── devtools/         # DevTools
└── [docs]
```

### Après (Monorepo)
```
vue-airport/
├── packages/
│   ├── core/         # vue-airport
│   ├── plugins/      # @vue-airport/plugins
│   └── devtools/     # vue-airport-devtools
├── app/              # Documentation
├── content/          # Contenu docs
└── turbo.json        # Config Turborepo
```

## 🔄 Changements pour les Utilisateurs

### Installation

**Avant :**
```bash
npm install vue-airport
```

**Après :**
```bash
# Core uniquement
npm install vue-airport

# Avec plugins de base
npm install vue-airport @vue-airport/plugins

# Avec DevTools
npm install vue-airport vue-airport-devtools
```

### Imports

**Avant :**
```typescript
import { useCheckIn, createActiveItemPlugin } from 'vue-airport';
```

**Après :**
```typescript
// Core (unchanged)
import { useCheckIn } from 'vue-airport';

// Plugins (now separate package)
import { createActiveItemPlugin } from '@vue-airport/plugins';
```

## ✅ Avantages du Monorepo

### 1. **Tree-shaking Optimal**
- Import uniquement ce dont vous avez besoin
- Bundles plus petits

### 2. **Versioning Indépendant**
- `vue-airport` → stable (1.x)
- `@vue-airport/plugins` → stable (1.x)
- `@vue-airport/plugins-media` → experimental (0.x)

### 3. **Organisation Claire**
```bash
# Plugins de base (tous projets)
@vue-airport/plugins

# Plugins médias (WebRTC, vidéo)
@vue-airport/plugins-media

# Plugins sociaux (présence, notifications)
@vue-airport/plugins-social

# Plugins collaboration (CRDT, cursors)
@vue-airport/plugins-collaboration
```

### 4. **DX Améliorée**
- Build en cache avec Turborepo
- Tests isolés par package
- Contributions plus faciles

## 🚀 Développement

### Installation
```bash
yarn install
```

### Build
```bash
# Build tous les packages (avec cache Turbo)
yarn build

# Build un package spécifique
yarn workspace vue-airport build
```

### Development
```bash
# Documentation
yarn dev

# Watch mode sur un package
cd packages/core && yarn dev
```

### Nettoyage
```bash
# Clean all
yarn clean

# Clean + rebuild
yarn clean && yarn build
```

## 📋 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `yarn build` | Build tous les packages avec Turborepo |
| `yarn build:docs` | Build la documentation uniquement |
| `yarn dev` | Démarre le serveur de documentation |
| `yarn clean` | Nettoie tous les artifacts de build |
| `yarn workspace vue-airport <cmd>` | Exécute une commande dans un package spécifique |

## 🔧 Configuration Turborepo

Le fichier `turbo.json` définit le pipeline de build :

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build les dépendances d'abord
      "outputs": ["dist/**"],
      "cache": true              // Cache actif
    }
  }
}
```

## 📦 Packages Actuels

### vue-airport
- Composable `useCheckIn`
- Système de desk
- Types de base
- **Stable** - v1.0.3

### @vue-airport/plugins
- `createActiveItemPlugin`
- `createValidationPlugin`
- `createDebouncePlugin`
- `createHistoryPlugin`
- **Stable** - v1.0.0

### vue-airport-devtools
- Intégration Vue DevTools
- Module Nuxt
- Plugin Vite
- **Stable** - v1.0.1

## 🎯 Prochains Packages (Planifiés)

### @vue-airport/plugins-media
WebRTC, streaming, vidéo
```typescript
import {
  createWebRTCPlugin,
  createStreamPlugin,
  createVideoPlayerPlugin
} from '@vue-airport/plugins-media';
```

### @vue-airport/plugins-social
Présence, réactions, notifications
```typescript
import {
  createPresencePlugin,
  createReactionsPlugin,
  createNotificationsPlugin
} from '@vue-airport/plugins-social';
```

### @vue-airport/plugins-collaboration
CRDT, cursors, co-editing
```typescript
import {
  createCRDTPlugin,
  createCursorsPlugin,
  createCoEditingPlugin
} from '@vue-airport/plugins-collaboration';
```

## 🐛 Problèmes Connus

### TypeScript dans @vue-airport/plugins
Les plugins génèrent des warnings TypeScript car ils ne trouvent pas `vue-airport` pendant la compilation.

**Solution en cours :** Ajouter une référence TypeScript dans le tsconfig.json des plugins.

### DevTools Warning Nuxt
Warning : "Plugin is not wrapped in defineNuxtPlugin"

**Impact :** Aucun, le plugin fonctionne correctement.
**Fix prévu :** Wrapper le plugin dans `defineNuxtPlugin`.

## 📝 Notes de Migration

- ✅ Tous les packages buildent correctement
- ✅ Turborepo cache fonctionne ("FULL TURBO")
- ✅ Yarn Workspaces configuré
- ✅ Documentation intacte
- ⚠️ Quelques warnings TypeScript (non bloquants)

## 🎓 Ressources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Vue Airport Documentation](https://benoitlahoz.github.io/vue-airport/)

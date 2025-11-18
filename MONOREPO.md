# Vue Airport - Monorepo

This is a monorepo managed with [Turborepo](https://turbo.build) and [Yarn Workspaces](https://yarnpkg.com/features/workspaces).

## 📦 Packages

### Core Packages

- **[vue-airport](./packages/core)** - Core composable `useCheckIn` and desk system
- **[@vue-airport/plugins](./packages/plugins)** - Base plugins (activeItem, validation, debounce, history)
- **[vue-airport-devtools](./packages/devtools)** - Vue DevTools integration

### Future Packages (Planned)

- `@vue-airport/plugins-media` - WebRTC, streaming, video players
- `@vue-airport/plugins-social` - Presence, reactions, notifications
- `@vue-airport/plugins-collaboration` - CRDT, cursors, co-editing
- `@vue-airport/plugins-performance` - Virtual scroll, lazy loading

## 🚀 Getting Started

```bash
# Install all dependencies
yarn install

# Build all packages
yarn build

# Build in watch mode
yarn dev

# Clean all build artifacts
yarn clean
```

## 📖 Documentation

The documentation is built with [Nuxt](https://nuxt.com) and [Docus](https://docus.dev).

```bash
# Start documentation dev server
yarn dev

# Build documentation for production
yarn build:docs
```

## 🏗️ Workspace Structure

```
vue-airport/
├── packages/
│   ├── core/          # vue-airport
│   ├── plugins/       # @vue-airport/plugins
│   └── devtools/      # vue-airport-devtools
├── app/               # Documentation app (Nuxt)
├── content/           # Documentation content
└── turbo.json         # Turborepo configuration
```

## 🔧 Development

### Adding a New Package

1. Create a new directory in `packages/`
2. Add `package.json` with `@vue-airport/*` naming
3. Update `turbo.json` if needed
4. Run `yarn install`

### Package Dependencies

Use workspace protocol for internal dependencies:

```json
{
  "dependencies": {
    "vue-airport": "workspace:*"
  }
}
```

### Building

Turborepo handles build ordering automatically based on dependencies.

```bash
# Build all packages in correct order
yarn build

# Build specific package
yarn workspace vue-airport build
```

## 📝 License

MIT © Benoit Lahoz

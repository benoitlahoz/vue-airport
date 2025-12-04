# Guide de migration - Optimisations Object Transformer

Ce guide vous aide à migrer vers la nouvelle version optimisée du package `object-transformer`.

## ✅ Changements rétro-compatibles

Bonne nouvelle : **toutes les optimisations sont rétro-compatibles** ! Votre code existant continuera de fonctionner sans modification.

## 🔄 Migration recommandée (optionnelle)

Bien que non obligatoire, nous recommandons de migrer progressivement vers les nouvelles APIs pour bénéficier de meilleures performances et maintenabilité.

### 1. Utilisation du nouveau modèle de métadonnées de clés

#### Avant (ancien code) :
```typescript
// Accès aux propriétés directes
if (node.keyModified) {
  const original = node.firstKey || node.originalKey;
  // ...
}
```

#### Après (nouveau code recommandé) :
```typescript
import { 
  isKeyModified, 
  getOriginalKey,
  markKeyAsModified 
} from '@vue-airport/object-transformer';

// Utilisation des fonctions utilitaires
if (isKeyModified(node)) {
  const original = getOriginalKey(node);
  // ...
}

// Pour marquer une clé comme modifiée
markKeyAsModified(node);
```

### 2. Initialisation des métadonnées pour les nouveaux nodes

#### Avant :
```typescript
const node = buildNodeTree(data, key, parent);
node.originalKey = key;
node.firstKey = key;
node.keyModified = false;
```

#### Après :
```typescript
import { buildNodeTree, initKeyMetadata } from '@vue-airport/object-transformer';

const node = buildNodeTree(data, key, parent);
initKeyMetadata(node, key);
```

### 3. Accès au transform index

Si vous avez du code qui recherche des transforms :

#### Avant :
```typescript
const transform = desk.transforms.value.find(t => t.name === 'MyTransform');
```

#### Après (plus performant) :
```typescript
const transform = desk.findTransform('MyTransform', node);
// ou pour un accès direct à la map :
const candidates = desk.getTransformsByName().get('MyTransform');
```

## 🔧 Migration des données existantes

### Structures de nodes existantes

Les nodes existants avec les anciennes propriétés (`originalKey`, `firstKey`, `keyModified`) continueront de fonctionner grâce aux fonctions de compatibilité :

```typescript
import { 
  getOriginalKeyCompat,
  getFirstKeyCompat,
  isKeyModifiedCompat 
} from '@vue-airport/object-transformer';

// Ces fonctions lisent les anciennes ET nouvelles propriétés
const original = getOriginalKeyCompat(node); // Lit keyMetadata.original OU originalKey/firstKey
const modified = isKeyModifiedCompat(node);  // Lit keyMetadata.modified OU keyModified
```

### Migration progressive

Pour migrer progressivement vos données :

```typescript
import { initKeyMetadata, getOriginalKeyCompat } from '@vue-airport/object-transformer';

function migrateNode(node: ObjectNodeData): void {
  // Si le node utilise encore l'ancien format
  if (!node.keyMetadata && (node as any).originalKey) {
    // Initialiser les nouvelles métadonnées
    initKeyMetadata(node, getOriginalKeyCompat(node));
    
    // Copier les flags
    if ((node as any).keyModified) {
      node.keyMetadata!.modified = true;
    }
    if ((node as any).autoRenamed) {
      node.keyMetadata!.autoRenamed = true;
    }
    
    // Optionnel : nettoyer les anciennes propriétés
    // delete (node as any).originalKey;
    // delete (node as any).firstKey;
    // delete (node as any).keyModified;
  }
  
  // Récursion pour les enfants
  if (node.children) {
    node.children.forEach(migrateNode);
  }
}

// Utilisation
migrateNode(desk.tree.value);
```

## 🎯 Vérification de la migration

### Checklist

- [ ] Code compile sans erreurs TypeScript
- [ ] Les tests passent
- [ ] Les recipes existantes s'appliquent correctement
- [ ] Les transformations structurelles fonctionnent (split, merge, etc.)
- [ ] Les renommages de clés sont correctement trackés
- [ ] Mode "model" fonctionne avec arrays

### Tests de performance

Pour vérifier les gains de performance :

```typescript
// Avant
console.time('applyRecipe');
const result1 = desk.applyRecipe(data, recipe);
console.timeEnd('applyRecipe');

// Après (devrait être significativement plus rapide)
console.time('applyRecipe-optimized');
const result2 = desk.applyRecipe(data, recipe);
console.timeEnd('applyRecipe-optimized');
```

## ⚠️ Points d'attention

### 1. Accès direct aux propriétés

**À éviter** : Accès direct aux propriétés internes
```typescript
// ❌ Ne pas faire
node.originalKey = 'newKey';
node.keyModified = true;
```

**Recommandé** : Utiliser les fonctions utilitaires
```typescript
// ✅ Faire
import { updateOriginalKey, markKeyAsModified } from '@vue-airport/object-transformer';
updateOriginalKey(node, 'newKey');
markKeyAsModified(node);
```

### 2. Sérialisation des nodes

Si vous sérialisez des nodes (JSON.stringify), les nouvelles métadonnées seront incluses automatiquement. Assurez-vous que votre code de désérialisation les supporte.

### 3. Extensions personnalisées

Si vous avez créé des extensions qui manipulent directement les nodes, vérifiez qu'elles utilisent les fonctions utilitaires plutôt que d'accéder directement aux propriétés.

## 🆘 Support et aide

### Problèmes connus

1. **TypeScript errors sur les anciennes propriétés** :
   - Solution : Utiliser les fonctions `*Compat` ou migrer vers `keyMetadata`

2. **Recipes créées avec l'ancien format** :
   - Solution : Elles sont automatiquement compatibles, pas d'action nécessaire

3. **Performance pas améliorée** :
   - Vérifier que vous utilisez la dernière version
   - Vérifier que `rebuildTransformIndex()` est appelé après `addTransforms()`

### Rollback

Si vous rencontrez des problèmes, vous pouvez revenir à l'ancienne version en :

1. Gardant les fonctions `*Compat`
2. N'utilisant pas `keyMetadata` explicitement
3. Continuant à utiliser les anciennes propriétés

Le code restera fonctionnel dans les deux sens.

## 📚 Ressources

- [OPTIMIZATIONS.md](./OPTIMIZATIONS.md) - Détails techniques des optimisations
- [README.md](./README.md) - Documentation générale du package
- [API Reference](./docs/api-reference.md) - Documentation complète de l'API

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub avec le tag `migration`.

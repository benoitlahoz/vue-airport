# Object Transformer - Optimisations des Recipes

Ce document décrit les optimisations apportées au système de création et d'application des recipes dans le package `object-transformer`.

## 🟢 Impact élevé, Effort faible

### 1. Map de transforms (O(1) lookup)

**Problème initial :**
- Recherche linéaire O(t) dans un array pour chaque step de la recipe
- `Array.find()` appelé de nombreuses fois pendant `applyRecipe`

**Solution implémentée :**
- Index `Map<string, Transform[]>` construit une seule fois au début de `applySingleRecipe`
- Lookup O(1) au lieu de O(t)
- Méthode `getTransformsByName()` exposée dans le context pour réutilisation

**Fichiers modifiés :**
- `utils/context/transform-operations.util.ts`
- `utils/transform/transform-recipe.util.ts`
- `types.ts`

**Gains estimés :**
- ~60-80% plus rapide pour recipes avec nombreux steps
- Impact proportionnel au nombre de transforms disponibles

---

### 2. Cache de traduction de chemins

**Problème initial :**
- `translatePath()` recalculait les mêmes chemins de manière répétée
- Complexité O(p²) où p = profondeur du chemin (slice + join à chaque itération)

**Solution implémentée :**
- `Map<string, string[]>` pour mémoriser les chemins déjà traduits
- Cache invalidé uniquement quand `pathTranslator` change
- Clé de cache : `originalPath.join('.')`

**Fichiers modifiés :**
- `utils/transform/transform-recipe.util.ts`

**Gains estimés :**
- ~40-60% plus rapide pour recipes avec chemins profonds
- Impact proportionnel au nombre de steps et de renames

---

### 3. Index de chemins pour applyTransformAtPath

**Problème initial :**
- Navigation répétée dans les objets pour chaque transformation
- Variables inutiles (`parentPath[]`) construites mais jamais utilisées

**Solution implémentée :**
- Navigation directe en un seul parcours
- Suppression des variables intermédiaires
- Early returns pour éviter les checks inutiles

**Fichiers modifiés :**
- `utils/transform/transform-recipe.util.ts` (fonctions `applyTransformAtPath`, `deleteAtPath`, `renameKeyAtPath`)

**Gains estimés :**
- ~15-25% plus rapide pour chaque opération de transformation
- Moins d'allocations mémoire

---

## 🟡 Impact élevé, Effort moyen

### 4. Simplifier le modèle de clés

**Problème initial :**
- 4 propriétés différentes pour gérer les clés : `key`, `originalKey`, `firstKey`, `keyModified`
- Logique dispersée et difficile à maintenir
- Mental overhead élevé

**Solution implémentée :**
- **Nouveau type `NodeKeyMetadata`** avec structure unifiée :
  ```typescript
  interface NodeKeyMetadata {
    original?: string;    // Original key (firstKey)
    modified?: boolean;   // User renamed
    autoRenamed?: boolean; // Auto-renamed for conflicts
    splitSource?: string; // Parent if from split
    splitIndex?: number;  // Index in split
  }
  ```
- **Fonctions utilitaires centralisées** dans `node-key-metadata.util.ts`
- **Fonctions de compatibilité** pour migration progressive (`getOriginalKeyCompat`, etc.)

**Fichiers créés :**
- `utils/node/node-key-metadata.util.ts` (nouveau)

**Fichiers modifiés :**
- `types.ts` (ajout `NodeKeyMetadata`, modification `ObjectNodeData`)
- `utils/transform/transform-recipe.util.ts`
- `utils/transform/transform-propagation.util.ts`
- `index.ts`

**Gains estimés :**
- Maintenance beaucoup plus facile
- Moins de bugs liés aux clés
- Code plus lisible et compréhensible

---

### 5. Copy-on-write pour le clonage

**Problème initial :**
- Clone profond complet à chaque `applyRecipe`, même si peu de données changent
- Parsing de dates ISO répété pour toutes les valeurs
- Pas de réutilisation des branches non modifiées

**Solution implémentée :**
- **`buildModifiedPaths()`** : analyse la recipe pour identifier les chemins modifiés
- **`copyOnWriteClone()`** : clone uniquement les branches qui seront modifiées
  - Branches non modifiées : réutilisées directement
  - Branches modifiées : shallow clone + récursion
- **Fallback `deepClone`** conservé pour compatibilité

**Fichiers créés :**
- `utils/transform/copy-on-write-clone.util.ts` (nouveau)

**Fichiers modifiés :**
- `utils/transform/transform-recipe.util.ts`
- `index.ts`

**Gains estimés :**
- ~50-70% plus rapide pour grandes structures avec modifications localisées
- Réduction significative de l'allocation mémoire
- Impact proportionnel au ratio (données modifiées / données totales)

---

### 6. Passe unique dans applySingleRecipe

**Problème initial :**
- 4 passes séparées sur les données :
  1. Source renames
  2. Transformations
  3. Deletions
  4. Structural renames
- Chaque passe nécessite de parcourir les chemins

**Solution implémentée :**
- **Unification des opérations** : toutes les opérations dans un seul array
- **Tri intelligent** :
  ```typescript
  sourceRename (depth 0→n) → 
  steps (depth 0→n) → 
  deletions (depth 0→n) → 
  structuralRenames (depth 0→n)
  ```
- **Exécution séquentielle** en une seule boucle
- Maintien de l'ordre logique (renames avant transforms, etc.)

**Fichiers modifiés :**
- `utils/transform/transform-recipe.util.ts`

**Gains estimés :**
- ~30-40% plus rapide grâce à moins de parcours
- Moins de code, plus maintenable
- Meilleure localité des données (cache-friendly)

---

## 📊 Résumé des gains cumulatifs

Pour une recipe typique avec :
- 50 steps de transformation
- 10 renames
- 5 deletions
- Profondeur moyenne de 3 niveaux
- 20 transforms disponibles

**Gains estimés combinés :**
- **Temps d'exécution** : ~65-80% plus rapide
- **Allocation mémoire** : ~50-60% de réduction
- **Maintenabilité** : Significativement améliorée

## 🔄 Compatibilité et migration

Toutes les optimisations incluent des fonctions de compatibilité :
- `getOriginalKeyCompat()`, `getFirstKeyCompat()`, `isKeyModifiedCompat()`
- Ancien format de données supporté
- Migration progressive possible

Les anciennes propriétés (`originalKey`, `firstKey`, `keyModified`) sont toujours lues via les fonctions `*Compat` pour assurer une transition en douceur.

## 🧪 Tests recommandés

1. **Tests de performance** :
   - Benchmarker `applyRecipe` avant/après
   - Tester avec différentes tailles de recipes
   - Mesurer l'allocation mémoire

2. **Tests de régression** :
   - Valider que toutes les recipes existantes fonctionnent
   - Vérifier les edge cases (renames imbriqués, splits multiples, etc.)
   - Tester la compatibilité avec anciennes données

3. **Tests de stress** :
   - Recipes avec >1000 steps
   - Structures très profondes (>10 niveaux)
   - Mode batch avec arrays de >1000 éléments

## 📝 Notes pour le futur

### Optimisations potentielles supplémentaires (non implémentées) :

1. **Worker threads** pour mode batch (Impact élevé, Effort élevé)
2. **Trie de chemins** pour lookups ultra-rapides (Impact moyen, Effort élevé)
3. **Format binaire** pour sérialisation (Impact moyen, Effort moyen)
4. **Streaming** pour très gros datasets (Impact élevé, Effort élevé)

### Breaking changes à considérer pour v2.0 :

- Supprimer complètement `originalKey`, `firstKey`, `keyModified` (utiliser uniquement `keyMetadata`)
- Standardiser sur copy-on-write (supprimer `deepClone` legacy)
- API de résultat typée : `Result<T, E>` au lieu de throws

---

**Date de dernière mise à jour :** 4 décembre 2025  
**Version :** 1.0.0 (optimisations initiales)

/**
 * Object Transformer Constants
 * Toutes les constantes et enums utilisées dans l'Object Transformer
 */

/**
 * Noms des slots disponibles pour la personnalisation
 */
export enum SlotName {
  // Slot principal pour le nœud complet
  Node = 'node',
  // Slots pour les parties du nœud
  ToggleIcon = 'toggle-icon',
  NodeValue = 'node-value',
  NodeActions = 'node-actions',
  TransformSelect = 'transform-select',
  NodeHeader = 'node-header',
  ChildrenContainer = 'children-container',
  TransformList = 'transform-list',
}

/**
 * Clés JavaScript réservées ou dangereuses qui ne peuvent pas être utilisées
 */
export enum ForbiddenKey {
  Proto = '__proto__',
  Prototype = 'prototype',
  Constructor = 'constructor',
  ToString = 'toString',
  DefineGetter = '__defineGetter__',
  DefineSetter = '__defineSetter__',
  LookupGetter = '__lookupGetter__',
  LookupSetter = '__lookupSetter__',
}

/**
 * Liste des clés interdites en tant que tableau
 */
export const FORBIDDEN_KEYS: readonly string[] = Object.values(ForbiddenKey);

/**
 * Attribut HTML utilisé pour identifier les slots personnalisés
 */
export const DATA_SLOT_ATTRIBUTE = 'data-slot';

/**
 * Attribut HTML utilisé pour le pattern as-child (comme shadcn-vue)
 */
export const AS_CHILD_ATTRIBUTE = 'as-child';

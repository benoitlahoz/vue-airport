// Public types for @vue-airport/object-transformer
import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { Notification, NotificationSeverity } from '@vue-airport/plugins-base';

export type TransformerMode = 'object' | 'model';

export interface PropertyVariation {
  property: string;
  presentIn: number;
  missingIn: number;
  totalObjects: number;
  coverage: number;
}

export type ErrorSeverity = NotificationSeverity;

export interface TransformerError extends Notification {
  code: string;
}

export type ObjectNodeType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'symbol'
  | 'boolean'
  | 'object'
  | 'array'
  | 'undefined'
  | 'function'
  | 'null'
  | 'unknown'
  | 'date';

export interface StructuralTransformResult {
  __structuralChange: true;
  action: 'split' | 'merge' | 'arrayToProperties' | 'toObject' | 'conditionalBranch';
  parts?: any[];
  object?: any;
  removeSource?: boolean;
  // For conditionalBranch action
  conditionMet?: boolean; // Result of the condition evaluation
  value?: any; // The value to branch
}

export interface Transform {
  name: string;
  applicableTo?: ObjectNodeType[]; // Filtre déclaratif par type de node
  if?: (node: ObjectNodeData) => boolean; // Optionnel, pour conditions avancées
  fn: (value: any, ...params: any[]) => any | StructuralTransformResult;
  params?: any[];
  structural?: boolean;
  // Conditional execution
  condition?: (value: any, ...params: any[]) => boolean; // Si défini, c'est un transform conditionnel
  conditionMet?: boolean; // 🔥 LOCAL to each node's transform instance (not shared)
}

export interface Condition {
  name: string;
  description?: string;
  applicableTo?: ObjectNodeType[]; // Filtre déclaratif par type de valeur
  if: (value: any, ...params: any[]) => boolean; // Teste la valeur directement
  params?: any[];
}

export interface TransformProvider {
  type: 'transform-provider';
  transforms: Transform[];
}

export interface ConditionProvider {
  type: 'condition-provider';
  conditions: Condition[];
}

// 🟡 OPTIMIZATION: Simplified key metadata structure
export interface NodeKeyMetadata {
  original?: string; // Original key from source data or at creation
  modified?: boolean; // True if user manually renamed this key
  autoRenamed?: boolean; // True if renamed automatically to avoid conflicts
  splitSource?: string; // ID of parent node if created by split
  splitIndex?: number; // Index in split array
}

export interface ObjectNodeData {
  id: string; // Unique identifier for the node
  type: ObjectNodeType;
  key?: string; // Current key (the only key property we need!)
  // 🟡 OPTIMIZATION: All key tracking in one metadata object
  keyMetadata?: NodeKeyMetadata;
  splitSourceId?: string; // ID of the node that created this node via split
  splitIndex?: number; // Index in the split array (0, 1, 2...)
  value: any;
  transforms: Transform[];
  children?: ObjectNodeData[];
  parent?: ObjectNodeData;
  deleted?: boolean; // True si la propriété est marquée comme supprimée
  isOpen?: boolean; // État d'ouverture des enfants (pour object/array)
}

export interface ObjectTransformerContext {
  // Tree
  tree: Ref<ObjectNodeData>;
  treeKey: Ref<number>; // Key to force complete remount of tree
  triggerTreeUpdate: () => void;
  originalData: Ref<any>;
  getNode: (id: string) => ObjectNodeData | null;
  // Mode
  mode: Ref<TransformerMode>;
  setMode: (mode: TransformerMode) => void;
  isObjectModeAvailable: ComputedRef<boolean>;
  isModelModeAvailable: ComputedRef<boolean>;
  templateIndex: Ref<number>;
  setTemplateIndex: (index: number) => void;
  mostCompleteIndex: ComputedRef<number>; // Index of the most complete object in array
  propertyVariations: ComputedRef<PropertyVariation[]>; // Property differences across array items
  // Constants
  primitiveTypes: ObjectNodeType[];
  // Structural Transform Handlers Registry
  structuralTransformHandlers: Record<string, (current: any, lastKey: string, result: any) => void>;
  // Transforms
  transforms: Ref<Transform[]>;
  findTransform: (name: string, node?: ObjectNodeData) => Transform | undefined;
  initParams: (transform: Transform) => any[];
  createTransformEntry: (
    name: string,
    node?: ObjectNodeData
  ) => (Transform & { params: any[] }) | null;
  propagateTransform: (node: ObjectNodeData) => void;
  computeStepValue: (node: ObjectNodeData, index: number) => any;
  // 🟢 OPTIMIZATION: Map-based transform lookup
  getTransformsByName: () => Map<string, Transform[]>;
  // Conditions
  conditions: Ref<Condition[]>;
  getCondition: (name: string) => Condition | undefined;
  // Nodes
  forbiddenKeys: Ref<string[]>;
  getComputedValueType: (node: ObjectNodeData, value: any) => ObjectNodeType;
  // Key editing
  editingNode: Ref<ObjectNodeData | null>;
  tempKey: Ref<string | null>;
  startEditKey: (node: ObjectNodeData) => void;
  confirmEditKey: (node: ObjectNodeData) => void;
  cancelEditKey: (node: ObjectNodeData) => void;
  // Node utilities (pure functions)
  isAddedProperty: (node: ObjectNodeData) => boolean;
  getKeyClasses: (node: ObjectNodeData) => string;
  generateChildKey: (child: ObjectNodeData, index: number) => string;
  toggleNodeDeletion: (node: ObjectNodeData) => void;
  // Transform selections
  nodeSelections: WeakMap<ObjectNodeData, string | null>;
  stepSelections: WeakMap<ObjectNodeData, Record<number, string | null>>;
  getNodeSelection: (node: ObjectNodeData) => string | null;
  setNodeSelection: (node: ObjectNodeData, value: string | null) => void;
  getStepSelection: (node: ObjectNodeData) => Record<number, string | null>;
  setStepSelection: (node: ObjectNodeData, value: Record<number, string | null>) => void;
  // Helpers
  getParamConfig: (transformName: string, paramIndex: number) => any;
  formatStepValue: (node: ObjectNodeData, index: number) => string;
  isStructuralTransform: (node: ObjectNodeData, transformIndex: number) => boolean;
  // Recipe management (v2)
  recipe: ComputedRef<any>; // Recipe from recipe/types.ts
  buildRecipe: () => any;
  applyRecipe: (data: any, recipe: any) => any;
  exportRecipe: () => string;
  importRecipe: (recipeJson: string) => void;
  // Model mode
  extractModelRules: () => any[];
  applyModelToAll: () => void;
  // Update descendant paths when renaming parent keys
  updateDescendantPaths: (
    parent: ObjectNodeData,
    oldParentKey: string | undefined,
    newParentKey: string
  ) => void;

  // Desk injection (must be called after desk creation)
  setDesk: (desk: any) => void;
}

export type ObjectTransformerDesk = any &
  ObjectTransformerContext & {
    errors: Ref<TransformerError[]>;
    notify: (error: Partial<TransformerError>) => void;
    dismiss: (id: string) => void;
    clearErrors: () => void;
    getErrors: () => TransformerError[];
  };

export const ObjectTransformerDeskKey: InjectionKey<ObjectTransformerDesk> =
  Symbol('ObjectTransformerDesk');

export type { ComputedRef, InjectionKey, Ref };

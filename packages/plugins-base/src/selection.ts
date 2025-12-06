import { ref, type Ref } from 'vue';
import type { CheckInPlugin, CheckInPluginMethods, DeskCore } from 'vue-airport';

export interface SelectionPluginMethods<T> extends CheckInPluginMethods<T> {
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export interface SelectionPluginRefs {
  selection: Ref<string | string[] | null>;
}

export interface SelectionPlugin<T>
  extends CheckInPlugin<T, SelectionPluginMethods<T>>,
    SelectionPluginRefs {
  methods: SelectionPluginMethods<T>;
}

export interface SelectionPluginOptions {
  /**
   * Allow multiple selection. Default: false.
   */
  multiple?: boolean;

  /**
   * Initial selection ID(s).
   */
  initialSelection?: string | string[];
}

/**
 * Plugin to manage selection state (single or multiple).
 */
export const createSelectionPlugin = <T = unknown>(
  options: SelectionPluginOptions = {}
): SelectionPlugin<T> => {
  const multiple = options.multiple ?? false;
  const selection = ref<string | string[] | null>(
    options.initialSelection ?? (multiple ? [] : null)
  );

  const select = (id: string) => {
    if (multiple) {
      const current = (selection.value as string[]) || [];
      if (!current.includes(id)) {
        selection.value = [...current, id];
      }
    } else {
      selection.value = id;
    }
  };

  const deselect = (id: string) => {
    if (multiple) {
      const current = (selection.value as string[]) || [];
      selection.value = current.filter((i) => i !== id);
    } else {
      if (selection.value === id) {
        selection.value = null;
      }
    }
  };

  const toggleSelection = (id: string) => {
    if (isSelected(id)) {
      deselect(id);
    } else {
      select(id);
    }
  };

  const clearSelection = () => {
    selection.value = multiple ? [] : null;
  };

  const isSelected = (id: string) => {
    if (multiple) {
      return ((selection.value as string[]) || []).includes(id);
    }
    return selection.value === id;
  };

  return {
    name: 'selection',
    version: '1.0.0',
    install: (desk: DeskCore<T>) => {
      (desk as any).selection = selection;
      (desk as any).select = select;
      (desk as any).deselect = deselect;
      (desk as any).toggleSelection = toggleSelection;
      (desk as any).clearSelection = clearSelection;
      (desk as any).isSelected = isSelected;

      return () => {
        selection.value = multiple ? [] : null;
      };
    },
    methods: {
      select,
      deselect,
      toggleSelection,
      clearSelection,
      isSelected,
    },
    selection,
  };
};

import { reactive } from 'vue';
import type { CheckInPlugin, CheckInPluginMethods, DeskCore } from 'vue-airport';

export interface StatePluginMethods<S> extends CheckInPluginMethods<S> {
  setState: (newState: Partial<S>) => void;
  resetState: () => void;
}

export interface StatePluginRefs<S> {
  state: S;
}

export interface StatePlugin<S>
  extends CheckInPlugin<any, StatePluginMethods<S>>,
    StatePluginRefs<S> {
  methods: StatePluginMethods<S>;
}

export interface StatePluginOptions<S> {
  initialState: S;
}

/**
 * Plugin to manage a local state store for the desk.
 */
export const createStatePlugin = <S extends object>(
  options: StatePluginOptions<S>
): StatePlugin<S> => {
  // Create a reactive copy of the initial state
  const state = reactive<S>({ ...options.initialState });

  const setState = (newState: Partial<S>) => {
    Object.assign(state, newState);
  };

  const resetState = () => {
    // Reset keys to initial values
    Object.keys(state).forEach((key) => {
      // @ts-expect-error - index signature
      state[key] = options.initialState[key];
    });
    // Re-assign initial values that might be missing if state was modified structurally
    Object.assign(state, options.initialState);
  };

  return {
    name: 'state',
    version: '1.0.0',
    install: (desk: DeskCore<any>) => {
      (desk as any).state = state;
      (desk as any).setState = setState;
      (desk as any).resetState = resetState;

      return () => {};
    },
    methods: {
      setState,
      resetState,
    },
    state: state as S,
  };
};

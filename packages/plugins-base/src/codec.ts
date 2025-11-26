import { ref } from 'vue';
import type {
  CheckInPlugin,
  CheckInPluginComputed,
  CheckInPluginMethods,
  DeskCore,
} from 'vue-airport';

export interface CodecPlugin<I, O>
  extends CheckInPlugin<I, CodecPluginMethods<I, O>, CodecPluginComputed> {
  canApplyCodec(codec: Codec<any, any>): boolean;
  methods: CodecPluginMethods<I, O>;
  computed: CodecPluginComputed;
}

export type CodecPluginExports<I, O> = CodecPluginMethods<I, O> & CodecPluginComputed;

export interface CodecPluginMethods<I, O> extends CheckInPluginMethods<I> {
  /**
   * Add a new codec to the plugin.
   * @param codec The codec to add.
   * @param autoEncode Whether to automatically encode existing items in the registry with the new codec.
   */
  addCodec(codec: Codec<any, any>, autoEncode?: boolean): void;

  /**
   * Encode an input value to the output type.
   * @param input The input value.
   * @returns The encoded output value.
   */
  encode(input: I): O;

  /**
   * Decode an output value back to the input type.
   * @param output The output value.
   * @returns The decoded input value.
   */
  decode(output: O): I;
}

export interface CodecPluginComputed extends CheckInPluginComputed {
  /**
   * List of errors encountered during encoding/decoding.
   */
  errors(): Error[];
}

export type Codec<I, O> = {
  name?: string;
  prop: string;
  targets?: string[];
  dependsOn?: string | string[];
  encode: (input: I, props: string | string[], targets: string[], desk: DeskCore<I>) => O;
  decode?: (output: O, props: string | string[], targets: string[], desk: DeskCore<O>) => I;
};

export type CodecOutput<Ts extends Codec<any, any>[], TIn> = Ts extends [
  Codec<infer _I, infer O>,
  ...infer Rest,
]
  ? Rest extends Codec<any, any>[]
    ? CodecOutput<Rest, O>
    : O
  : TIn;

export function createCodecPlugin<I, Ts extends [Codec<any, any>, ...Codec<any, any>[]]>(
  codecs: Ts = [] as unknown as Ts,
  options?: {
    onEncode?: (input: I, output: CodecOutput<Ts, I>) => void;
    onDecode?: (output: CodecOutput<Ts, I>, input: I) => void;
    onError?: (error: Error) => void;
  }
): CodecPlugin<I, CodecOutput<Ts, I>> {
  const errors = ref<Error[]>([]);
  let deskInstance: DeskCore<I> | null = null;

  return {
    name: 'codec',
    version: '1.0.0',
    install: (desk) => {
      deskInstance = desk as DeskCore<I>;
      return () => {
        // Cleanup if necessary
      };
    },

    canApplyCodec: (codec: Codec<any, any>): boolean => {
      if (!deskInstance) {
        throw new Error('Desk instance not initialized');
      }
      if (!codec.dependsOn) {
        return true;
      }
      const dependencies = Array.isArray(codec.dependsOn) ? codec.dependsOn : [codec.dependsOn];
      return dependencies.every((dep) => {
        return codecs.some((c) => c.name === dep);
      });
    },

    async onBeforeCheckIn(_id: string | number, item: I): Promise<boolean> {
      try {
        const result = this.methods.encode(item);
        Object.assign(item as any, result);
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('Unknown error during encoding');
        if (options?.onError) {
          options.onError(error);
        }
        errors.value.push(error);
        return false;
      }

      return true;
    },

    methods: {
      addCodec(codec: Codec<any, any>, autoEncode = false) {
        if (!this.canApplyCodec(codec)) {
          const error = new Error(
            `Cannot apply codec: missing dependencies for codec ${codec.name}`
          );
          console.warn(error.message);
          errors.value.push(error);
        }

        codecs.push(codec as any);
        if (!deskInstance) {
          throw new Error('Desk instance not initialized');
        }
        if (!autoEncode) {
          return;
        }

        // Re-encode all items in the registry with the new codec
        deskInstance.registryList.value.forEach((item, id) => {
          try {
            const encoded = this.encode(item as any);
            deskInstance!.update(id, encoded);
          } catch (e) {
            const error = e instanceof Error ? e : new Error('Unknown error during re-encoding');
            console.error('Add codec error:', error);
            if (options?.onError) {
              options.onError(error);
            }
            errors.value.push(error);
          }
        });
      },
      encode(input: I): CodecOutput<Ts, I> {
        try {
          if (!deskInstance) {
            throw new Error('Desk instance not initialized');
          }
          const result = codecs.reduce((acc, t) => {
            return t.encode(acc, t.prop, t.targets ?? [], deskInstance!);
          }, input) as CodecOutput<Ts, I>;
          if (options?.onEncode) {
            options.onEncode(input, result);
          }
          return result;
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error during encoding');
          console.error('Encoding error:', error);
          if (options?.onError) {
            options.onError(error);
          }
          errors.value.push(error);
          return input as CodecOutput<Ts, I>;
        }
      },
      decode(output: any): I {
        try {
          if (!deskInstance) {
            throw new Error('Desk instance not initialized');
          }
          const result = codecs.reduceRight((acc, t) => {
            if (t.decode) {
              return t.decode(acc, t.prop, t.targets ?? [], deskInstance!);
            }
            const error = new Error('Cannot decode: decode method not defined for the codec');
            console.error('Decoding error:', error);
            errors.value.push(error);
            if (options?.onError) {
              options.onError(error);
            }
            return output;
          }, output) as I;
          if (options?.onDecode) {
            options.onDecode(output, result);
          }
          return result;
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error during decoding');
          console.error('Decoding error:', error);
          if (options?.onError) {
            options.onError(error);
          }
          errors.value.push(error);
          return output as I;
        }
      },
    },

    computed: {
      errors() {
        return errors.value;
      },
    },
  };
}

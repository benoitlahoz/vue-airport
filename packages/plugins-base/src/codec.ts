import { ref } from 'vue';
import type { CheckInPlugin, DeskCore } from 'vue-airport';

export interface CodecPlugin<I, O>
  extends CheckInPlugin<I, CodecPluginMethods<I, O>, CodecPluginComputed> {
  methods: CodecPluginMethods<I, O>;
  computed: CodecPluginComputed;
}

export type CodecPluginExports<I, O> = CodecPluginMethods<I, O> & CodecPluginComputed;

export interface CodecPluginMethods<I, O> {
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

export interface CodecPluginComputed {
  /**
   * List of errors encountered during encoding/decoding.
   */
  errors(): Error[];
}

export type Codec<I, O> =
  | ((input: I) => O)
  | {
      name?: string;
      encode: (input: I, desk: DeskCore<I>) => O;
      decode?: (output: O, desk: DeskCore<O>) => I;
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
  codecs: Ts,
  options: {
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

    async onBeforeCheckIn(id: string | number, item: I): Promise<boolean> {
      try {
        const result = this.methods.encode(item);
        Object.assign(item as any, result);
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('Unknown error during encoding');
        if (options.onError) {
          options.onError(error);
        }
        errors.value.push(error);
        return false;
      }
      return true;
    },

    methods: {
      encode(input: I): CodecOutput<Ts, I> {
        try {
          if (!deskInstance) {
            throw new Error('Desk instance not initialized');
          }
          return codecs.reduce(
            (acc, t) => (typeof t === 'function' ? t(acc) : t.encode(acc, deskInstance!)),
            input
          ) as CodecOutput<Ts, I>;
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error during encoding');
          if (options.onError) {
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
          return codecs.reduceRight((acc, t) => {
            if (typeof t === 'function') {
              throw new Error('Cannot decode: codec is a function');
            }
            if (t.decode) {
              return t.decode(acc, deskInstance!);
            }
            throw new Error('Cannot decode: decode method not defined for the codec');
          }, output) as I;
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error during decoding');
          if (options.onError) {
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

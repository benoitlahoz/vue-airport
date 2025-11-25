// Pipe séquentiel typé pour chaîner des transformations
export type Transform<I, O> = (input: I) => O;

type PipeOutput<Ts extends Transform<any, any>[], TIn> = Ts extends [
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Transform<infer _I, infer O>,
  ...infer Rest,
]
  ? Rest extends Transform<any, any>[]
    ? PipeOutput<Rest, O>
    : O
  : TIn;

export function runTypedPipe<Ts extends [Transform<any, any>, ...Transform<any, any>[]], TIn>(
  initial: TIn,
  transforms: Ts
): PipeOutput<Ts, TIn> {
  return transforms.reduce((acc, fn) => fn(acc), initial) as PipeOutput<Ts, TIn>;
}

// Transformations typées
const splitName: Transform<{ name: string }, { firstname: string; lastname: string }> = (input) => {
  const [firstname = '', lastname = ''] = input.name.split(' ');
  return { firstname, lastname };
};

const capitalizeFirstname: Transform<
  { firstname: string; lastname: string },
  { firstname: string; lastname: string }
> = (input) => ({
  ...input,
  firstname: input.firstname.charAt(0).toUpperCase() + input.firstname.slice(1),
});

const uppercaseLastname: Transform<
  { firstname: string; lastname: string },
  { firstname: string; lastname: string }
> = (input) => ({
  ...input,
  lastname: input.lastname.toUpperCase(),
});

// Exemple d'utilisation séquentielle typée
export const resultTyped = runTypedPipe({ name: 'john doe' }, [
  splitName,
  capitalizeFirstname,
  uppercaseLastname,
]);
// resultTyped est typé : { firstname: string; lastname: string }
/*
// Exemple d'utilisation typée
type Input = { name: string; city: string; age: number };
type Output = { firstname: string; lastname: string; city: string; age: number };

const input: Input = { name: 'john doe', city: 'paris', age: 30 };
const config = ['splitName', 'capitalizeFirstname', 'uppercaseLastname'] as const;
const result = (runPipeByKey as any)(input, {}); // exemple d'appel typé
// result: { firstname: 'John', lastname: 'DOE', city: 'paris', age: 30 }

// Exemple d'utilisation
// const config = ['splitName', 'capitalizeFirstname', 'uppercaseLastname'];
// const result = runPipe({ name: 'john doe' }, config);
// Résultat: { name: 'john doe', firstname: 'John', lastname: 'DOE' }
export const useTransforms = (transforms: { name: string; fn: (value: any) => any }[]) => {
  return {};
};
*/

export type RemoveField<Type, Name extends string> = {
  [Property in keyof Type as Exclude<Property, Name>]: Type[Property];
};

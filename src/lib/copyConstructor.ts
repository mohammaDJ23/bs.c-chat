export function copyConstructor<T extends object>(instance: T): T {
  const copy = new (instance.constructor as Constructor)(instance);
  return Object.assign(copy, instance);
}

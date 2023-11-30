export function isArrayOfNumber(value: number[]): string | undefined {
  const isValidNumbers = value.every((val) => !Number.isNaN(val));
  if (!isValidNumbers) return 'Invalid number';
}

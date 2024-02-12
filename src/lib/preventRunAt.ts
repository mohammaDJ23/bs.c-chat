export function preventRunAt<T extends any, K = any>(fn: (data: T) => K, num: number) {
  let count = 0;

  return function (data: T) {
    count++;

    if (count <= num) {
      return;
    }

    fn.call(window, data);
  };
}

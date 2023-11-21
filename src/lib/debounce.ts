export function debounce(timeout = 500) {
  let timer: undefined | NodeJS.Timeout = undefined;
  return (func: () => void) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply({});
    }, timeout);
  };
}

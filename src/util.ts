export const isPlainObject = obj =>
  typeof obj === "object" && obj.constructor === Object;

export function shallowEquals(a, b) {
  for (let key in a) if (a[key] !== b[key]) return false;
  for (let key in b) if (!(key in a)) return false;
  return true;
}

export function debounce(fn) {
  let x;
  return function() {
    cancelAnimationFrame(x);
    x = requestAnimationFrame(fn.bind(null, arguments));
  };
}

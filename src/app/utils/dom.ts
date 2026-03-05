export function assertEl<T extends Element>(el: T | null, msg: string): T {
  if (!el) throw new Error(msg);
  return el;
}
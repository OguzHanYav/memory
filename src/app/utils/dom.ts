/** Gibt das Element zurück oder wirft einen Fehler, wenn es nicht existiert */
export function assertEl<T extends Element>(element: T | null, message: string): T {
  if (!element) {
    throw new Error(message);
  }

  return element;
}
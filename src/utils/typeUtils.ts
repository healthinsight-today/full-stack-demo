/**
 * Safely access a potentially undefined array property and perform operations
 * Returns a default value if the property is undefined
 */
export function safeArrayAccess<T, R>(
  array: T[] | undefined,
  operation: (arr: T[]) => R,
  defaultValue: R
): R {
  if (!array || !Array.isArray(array)) {
    return defaultValue;
  }
  return operation(array);
}

/**
 * Safely check if an array has items
 */
export function hasItems<T>(array: T[] | undefined): boolean {
  return !!array && Array.isArray(array) && array.length > 0;
}

/**
 * Safely get array length
 */
export function safeArrayLength<T>(array: T[] | undefined): number {
  if (!array || !Array.isArray(array)) {
    return 0;
  }
  return array.length;
}

/**
 * Safely access object properties
 */
export function safeObjectAccess<T, K extends keyof T, R>(
  obj: T | undefined,
  key: K,
  operation: (value: NonNullable<T[K]>) => R,
  defaultValue: R
): R {
  if (!obj || obj[key] === undefined || obj[key] === null) {
    return defaultValue;
  }
  return operation(obj[key] as NonNullable<T[K]>);
}

/**
 * Type guard for non-undefined values
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
} 
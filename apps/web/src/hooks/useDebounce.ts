import { useEffect, useState } from "react";

/**
 * Provides a debounced version of a value that updates only after the value remains unchanged for a specified delay.
 *
 * @param value - The source value to debounce
 * @param delay - Delay in milliseconds to wait after the last change before updating the returned value
 * @returns The input value, updated only after it has remained unchanged for `delay` milliseconds
 */
export function useDebounce<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timer)
  },[value, delay])

  return debouncedValue;
}
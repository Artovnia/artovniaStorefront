import { useState, useEffect } from 'react'

/**
 * Custom hook for persisting state in localStorage
 * Type-safe implementation with fallback
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue
        setStoredValue(newValue)
      } catch (error) {
        console.error(`Error parsing localStorage change for key "${key}":`, error)
      }
    }

    // Add event listener
    window.addEventListener('storage', handleStorageChange)
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [initialValue, key])

  return [storedValue, setValue]
}

export default useLocalStorage

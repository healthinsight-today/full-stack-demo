/**
 * Local Storage Service
 * Provides utility functions for working with browser's localStorage
 */

// Save data to localStorage
export const setItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Get data from localStorage
export const getItem = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return defaultValue;
  }
};

// Remove item from localStorage
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Clear all localStorage data
export const clear = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Check if a key exists in localStorage
export const hasKey = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Error checking localStorage key:', error);
    return false;
  }
};

export default {
  setItem,
  getItem,
  removeItem,
  clear,
  hasKey
};

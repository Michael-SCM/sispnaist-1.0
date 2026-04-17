import { useState, useEffect } from 'react';

/**
 * Hook para busca com debounce
 * @param value - Valor da busca
 * @param delay - Tempo de debounce em ms (padrão: 500)
 */
export const useDebounce = (value: string, delay: number = 500): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para usar localStorage de forma reativa
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook para gerenciar filtros com persistência em localStorage
 */
export const useFilters = (storageKey: string, initialFilters: Record<string, any>) => {
  const [filters, setFilters] = useLocalStorage<Record<string, any>>(storageKey, initialFilters);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev: Record<string, any>) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};

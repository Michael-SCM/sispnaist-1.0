import React from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
): LoadingState & { data: T | null } => {
  const [state, setState] = React.useState<{ data: T | null } & LoadingState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const execute = React.useCallback(async () => {
    setState({ isLoading: true, data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ isLoading: false, data: response, error: null });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState({ isLoading: false, data: null, error: message });
      return null;
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};


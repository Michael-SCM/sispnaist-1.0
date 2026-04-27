import { useState, useEffect, useCallback } from 'react';
import { catalogoService } from '../services/catalogoService.js';
import { ICatalogoItem } from '../types/index.js';

export function useCatalogo(entidade: string) {
  const [itens, setItens] = useState<ICatalogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const carregar = useCallback(async () => {
    if (!entidade) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogoService.listarAtivos(entidade);
      setItens(data);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao carregar catálogo ${entidade}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [entidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const refetch = useCallback(() => {
    carregar();
  }, [carregar]);

  return { itens, isLoading, error, refetch };
}

export default useCatalogo;


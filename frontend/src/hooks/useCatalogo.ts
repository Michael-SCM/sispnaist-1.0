import { useState, useEffect, useCallback } from 'react';
import { catalogoService } from '../services/catalogoService.js';
import { ICatalogoItem } from '../types/index.js';

// Cache global em memória para evitar requisições redundantes de catálogos estáticos
const catalogoCache: { [entidade: string]: ICatalogoItem[] } = {};
const pendingRequests: { [entidade: string]: Promise<ICatalogoItem[]> } = {};

export function useCatalogo(entidade: string) {
  const [itens, setItens] = useState<ICatalogoItem[]>(catalogoCache[entidade] || []);
  const [isLoading, setIsLoading] = useState(!catalogoCache[entidade]);
  const [error, setError] = useState<Error | null>(null);

  const carregar = useCallback(async () => {
    if (!entidade) return;

    // Se o catálogo já estiver no cache, define o estado e pula a requisição de rede
    if (catalogoCache[entidade]) {
      setItens(catalogoCache[entidade]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Coalesce chamadas concorrentes para a mesma entidade na rede
      let promise = pendingRequests[entidade];
      if (!promise) {
        promise = catalogoService.listarAtivos(entidade);
        pendingRequests[entidade] = promise;
      }

      const data = await promise;
      catalogoCache[entidade] = data;
      setItens(data);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao carregar catálogo ${entidade}:`, err);
    } finally {
      delete pendingRequests[entidade];
      setIsLoading(false);
    }
  }, [entidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const refetch = useCallback(() => {
    // Limpa o cache desta entidade antes de recarregar
    delete catalogoCache[entidade];
    carregar();
  }, [carregar, entidade]);

  return { itens, isLoading, error, refetch };
}

export default useCatalogo;


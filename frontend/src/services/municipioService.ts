export interface Municipio {
  n: string;
  u: string;
}

let cache: Municipio[] | null = null;

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function carregarMunicipios(): Promise<Municipio[]> {
  if (cache) return cache;
  const response = await fetch('/data/municipios-brasil.json');
  cache = await response.json();
  return cache!;
}

export const municipioService = {
  buscar: async (q: string): Promise<Municipio[]> => {
    if (!q || q.length < 2) return [];
    const municipios = await carregarMunicipios();
    const termo = normalize(q);
    return municipios
      .filter((m) => {
        const nome = normalize(m.n);
        return nome.startsWith(termo) || nome.includes(' ' + termo);
      })
      .slice(0, 20);
  },
};

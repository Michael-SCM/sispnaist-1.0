export interface Municipio {
  n: string;
  u: string;
  p: string;
}

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

let queryId = 0;

export const municipioService = {
  buscar: async (q: string): Promise<Municipio[]> => {
    if (!q || q.length < 2) return [];

    const currentId = ++queryId;
    const termo = normalize(q);

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=15&addressdetails=1&featureType=settlement`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Sispnaist/1.0' } });
      if (!res.ok) return [];

      const data = await res.json();

      // Ignora resposta de consulta anterior
      if (currentId !== queryId) return [];

      const seen = new Set<string>();

      return data
        .map((item: any) => {
          const addr = item.address || {};
          const cidade = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
          const estado = addr.state || '';
          const pais = addr.country || '';
          return { n: cidade, u: estado, p: pais };
        })
        .filter((m: Municipio) => {
          if (!m.n || m.n.length < 2) return false;
          // Filtra apenas cidades que começam com o termo digitado
          if (!normalize(m.n).startsWith(termo)) return false;
          const key = normalize(`${m.n}|${m.u}|${m.p}`);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 10);
    } catch {
      return [];
    }
  },
};

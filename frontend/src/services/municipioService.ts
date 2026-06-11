export interface Municipio {
  n: string;
  u: string;
  p: string;
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

let lastNominatimCall = 0;

async function buscarNominatim(q: string): Promise<Municipio[]> {
  const now = Date.now();
  if (now - lastNominatimCall < 1100) return [];
  lastNominatimCall = now;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&featureType=settlement`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Sispnaist/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => {
      const addr = item.address || {};
      const cidade = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const estado = addr.state || '';
      const pais = addr.country || '';
      return { n: cidade, u: estado, p: pais };
    }).filter((m: Municipio) => m.n && m.n.length >= 2);
  } catch {
    return [];
  }
}

export const municipioService = {
  buscar: async (q: string): Promise<Municipio[]> => {
    if (!q || q.length < 2) return [];

    const termo = normalize(q);

    // Search local Brazilian cities
    const municipios = await carregarMunicipios();
    const locais = municipios
      .filter((m) => {
        const nome = normalize(m.n);
        return nome.startsWith(termo) || nome.includes(' ' + termo);
      })
      .slice(0, 15);

    // Search worldwide via Nominatim
    const mundiais = await buscarNominatim(q);

    // Merge: local first, then international (deduplicate by city+state+country)
    const seen = new Set(locais.map((m) => `${m.n}|${m.u}|${m.p}`));
    const combined = [...locais];
    for (const m of mundiais) {
      const key = `${m.n}|${m.u}|${m.p}`;
      if (!seen.has(key)) {
        combined.push(m);
        seen.add(key);
      }
      if (combined.length >= 20) break;
    }

    return combined;
  },
};

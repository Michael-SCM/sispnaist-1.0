export interface Municipio {
  n: string;
  u: string;
  p: string;
}

let cacheLocal: Municipio[] | null = null;

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function carregarLocal(): Promise<Municipio[]> {
  if (cacheLocal) return cacheLocal;
  const res = await fetch('/data/municipios-brasil.json');
  const raw: { n: string; u: string }[] = await res.json();
  cacheLocal = raw.map((m) => ({ ...m, p: 'Brasil' }));
  return cacheLocal!;
}

let queryId = 0;

async function buscarNominatim(q: string): Promise<Municipio[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10&addressdetails=1&featureType=settlement`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Sispnaist/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .map((item: any) => {
      const addr = item.address || {};
      const cidade = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const estado = addr.state || '';
      const pais = addr.country || '';
      return { n: cidade, u: estado, p: pais };
    })
    .filter((m: Municipio) => m.n && m.n.length >= 2);
}

export const municipioService = {
  buscar: async (q: string): Promise<Municipio[]> => {
    if (!q || q.length < 2) return [];

    const id = ++queryId;
    const termo = normalize(q);

    // 1) Busca local instantânea (cidades brasileiras)
    const locais = await carregarLocal();
    const matchLocal = locais.filter((m) => {
      const nome = normalize(m.n);
      return nome.startsWith(termo) || nome.includes(' ' + termo);
    });

    // Se já tem resultado local suficiente, mostra rápido sem chamar Nominatim
    if (matchLocal.length >= 5) {
      return matchLocal.slice(0, 10);
    }

    // 2) Busca Nominatim em paralelo (internacionais + complemento BR)
    const nomMatch = await buscarNominatim(q);

    // Ignora se usuário já digitou mais
    if (id !== queryId) return matchLocal.slice(0, 10);

    // 3) Mescla: locais primeiro, depois Nominatim (sem duplicar)
    const chavesLocal = new Set(matchLocal.map((m) => normalize(m.n + m.u)));
    const combinado = [...matchLocal];
    for (const m of nomMatch) {
      const chave = normalize(m.n + m.u);
      if (!chavesLocal.has(chave)) {
        combinado.push(m);
        chavesLocal.add(chave);
      }
      if (combinado.length >= 10) break;
    }

    return combinado;
  },
};

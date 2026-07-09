import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../layouts/MainLayout.js';
import { DocumentTitle } from '../../hooks/useDocumentTitle.js';
import { Search, ShieldCheck, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

interface Municipio {
  n: string;
  u: string;
}

interface Habilitacao {
  municipio: string;
  uf: string;
}

let municipiosCache: Municipio[] | null = null;

const carregarMunicipios = async (): Promise<Municipio[]> => {
  if (municipiosCache) return municipiosCache;
  const res = await fetch('/data/municipios-brasil.json');
  municipiosCache = await res.json();
  return municipiosCache!;
};

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const HabilitacaoPnaist: React.FC = () => {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [habilitados, setHabilitados] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [ufFilter, setUfFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [muns, res] = await Promise.all([
          carregarMunicipios(),
          api.get('/habilitacao-pnaist/habilitados'),
        ]);
        setMunicipios(muns);
        const habs: Habilitacao[] = res.data.data || [];
        setHabilitados(new Set(habs.map(h => `${h.municipio}|${h.uf}`)));
      } catch (e) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggle = async (municipio: string, uf: string) => {
    const key = `${municipio}|${uf}`;
    const estaHabilitado = habilitados.has(key);
    setSaving(key);
    try {
      if (estaHabilitado) {
        await api.post('/habilitacao-pnaist/desabilitar', { municipio, uf });
        setHabilitados(prev => { const next = new Set(prev); next.delete(key); return next; });
      } else {
        await api.post('/habilitacao-pnaist/habilitar', { municipio, uf });
        setHabilitados(prev => new Set(prev).add(key));
      }
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(null);
    }
  };

  const filtered = useMemo(() => {
    let list = municipios;
    if (ufFilter) list = list.filter(m => m.u === ufFilter);
    if (search) {
      const term = search.toLowerCase();
      const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      list = list.filter(m => norm(m.n).includes(norm(term)));
    }
    return list;
  }, [municipios, ufFilter, search]);

  const stats = useMemo(() => {
    const total = municipios.length;
    const habilitado = habilitados.size;
    return { total, habilitado, percentual: total > 0 ? Math.round((habilitado / total) * 100) : 0 };
  }, [municipios.length, habilitados.size]);

  return (
    <MainLayout>
      <DocumentTitle title="Habilitação PNAIST" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <ShieldCheck size={28} className="text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Habilitação PNAIST</h1>
            <p className="text-slate-500 font-medium">Gerencie quais municípios estão habilitados para a Política Nacional de Saúde do Trabalhador do SUS</p>
          </div>
        </div>

        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 font-medium">Total de Municípios</p>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 font-medium">Habilitados</p>
              <p className="text-3xl font-black text-emerald-600">{stats.habilitado}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 font-medium">% Habilitados</p>
              <p className="text-3xl font-black text-indigo-600">{stats.percentual}%</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Buscar município..."
              />
            </div>
            <div className="relative w-40">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={ufFilter}
                onChange={e => setUfFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="">Todas UFs</option>
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Município</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">UF</th>
                  <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Habilitado PNAIST</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-12 text-slate-400">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-12 text-slate-400">Nenhum município encontrado</td></tr>
                ) : filtered.map(m => {
                  const key = `${m.n}|${m.u}`;
                  const isHabilitado = habilitados.has(key);
                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{m.n}</td>
                      <td className="px-6 py-4 text-slate-500 uppercase">{m.u}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggle(m.n, m.u)}
                          disabled={saving === key}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            isHabilitado ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            isHabilitado ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HabilitacaoPnaist;

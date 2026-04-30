import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import { Settings, ChevronRight, Database, Search, ArrowRight } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

interface Catalogo {
  slug: string;
  nome: string;
  descricao: string;
  count: number;
}

const ListaCatalogos: React.FC = () => {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregarCatalogos();
  }, []);

  const carregarCatalogos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catalogos');
      setCatalogos(response.data.data.catalogos);
    } catch (error) {
      toast.error('Erro ao carregar catálogos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tabelas de Referência</h1>
            <p className="text-slate-500 font-medium">Gerencie os catálogos e taxonomias do sistema</p>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse"></div>
            ))
          ) : (
            catalogos.map((catalogo) => (
              <button
                key={catalogo.slug}
                onClick={() => navigate(`/admin/catalogos/${catalogo.slug}`)}
                className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none">
                  <Database size={100} />
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Database size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{catalogo.nome}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{catalogo.descricao}</p>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-auto">
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg tracking-widest">
                    {catalogo.count} Itens
                  </span>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    Gerenciar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaCatalogos;

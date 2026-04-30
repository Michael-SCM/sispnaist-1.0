import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import { ArrowLeft, Plus, Edit2, Trash2, Database, Save, X, Search } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout.js';
import toast from 'react-hot-toast';

interface ItemCatalogo {
  _id?: string;
  valor: string;
  descricao?: string;
  ativo: boolean;
}

const ItensCatalogo: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ItemCatalogo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [nomeCatalogo, setNomeCatalogo] = useState('');

  const [formData, setFormData] = useState<ItemCatalogo>({
    valor: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    carregarItens();
  }, [slug]);

  const carregarItens = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/catalogos/${slug}`);
      setItens(response.data.data.itens);
      setNomeCatalogo(response.data.data.nome);
    } catch (error) {
      toast.error('Erro ao carregar itens do catálogo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ItemCatalogo) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await api.delete(`/catalogos/${slug}/${id}`);
        toast.success('Item excluído com sucesso');
        carregarItens();
      } catch (error) {
        toast.error('Erro ao excluir item');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/catalogos/${slug}/${editingItem._id}`, formData);
        toast.success('Item atualizado com sucesso');
      } else {
        await api.post(`/catalogos/${slug}`, formData);
        toast.success('Item adicionado com sucesso');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ valor: '', descricao: '', ativo: true });
      carregarItens();
    } catch (error) {
      toast.error('Erro ao salvar item');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/catalogos')}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{nomeCatalogo}</h1>
              <p className="text-slate-500 font-medium">Gestão de termos e valores do catálogo</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingItem(null); }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              Adicionar Item
            </button>
          )}
        </div>

        {/* Dynamic Form Overlay/Inline */}
        {showForm && (
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingItem ? 'Editar Termo' : 'Novo Termo'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Valor do Termo *</label>
                <input
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white outline-none transition-all font-bold text-lg"
                  placeholder="Ex: Trabalho Externo"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Descrição / Notas</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white outline-none transition-all resize-none"
                  placeholder="Opcional..."
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-95"
                >
                  <Save size={20} />
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Termo</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-8 py-6 h-16 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : itens.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">
                      Nenhum item cadastrado neste catálogo.
                    </td>
                  </tr>
                ) : (
                  itens.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <Database size={18} />
                          </div>
                          <span className="font-bold text-slate-700 block text-lg">{item.valor}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-500 max-w-sm truncate">
                          {item.descricao || <span className="text-slate-300 italic text-xs">Sem descrição</span>}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ItensCatalogo;

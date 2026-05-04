import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout.js';
import { materialBiologicoService } from '../../../services/materialBiologicoService.js';
import { acidenteService } from '../../../services/acidenteService.js';
import { catalogoService } from '../../../services/catalogoService.js';
import { IMaterialBiologico, IAcidente, ICatalogoItem } from '../../../types/index.js';
import { 
  Dna, 
  ArrowLeft, 
  Save, 
  Info,
  Shield,
  Activity,
  UserCheck,
  Calendar,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NovoMaterialBiologico: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateAcidenteId = location.state?.acidenteId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [acidentesRecentes, setAcidentesRecentes] = useState<IAcidente[]>([]);
  
  // Catálogos
  const [catalogos, setCatalogos] = useState<{ [key: string]: ICatalogoItem[] }>({});

  const [formData, setFormData] = useState<Partial<IMaterialBiologico>>({
    acidenteId: stateAcidenteId || '',
    tipoExposicao: '',
    materialOrganico: '',
    circunstanciaAcidente: '',
    agente: '',
    equipamentoProtecao: '',
    sorologiaPaciente: '',
    sorologiaAcidentado: '',
    conduta: '',
    evolucaoCaso: '',
    usoEPI: false,
    sorologiaFonte: false,
    acompanhamentoPrEP: false,
    efeitoColateralPermanente: false,
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [
          acidentesRes,
          exposicao,
          material,
          circunstancia,
          agente,
          epi,
          sorologia,
          conduta,
          evolucao
        ] = await Promise.all([
          acidenteService.listar(1, 20, { tipoAcidente: 'Acidente com Material Biológico' }),
          catalogoService.listarAtivos('tipoExposicao'),
          catalogoService.listarAtivos('materialOrganico'),
          catalogoService.listarAtivos('circunstanciaAcidente'),
          catalogoService.listarAtivos('agente'),
          catalogoService.listarAtivos('equipamentoProtecao'),
          catalogoService.listarAtivos('sorologia'),
          catalogoService.listarAtivos('conduta'),
          catalogoService.listarAtivos('evolucaoCaso')
        ]);

        setAcidentesRecentes(acidentesRes.acidentes);
        setCatalogos({
          tipoExposicao: exposicao,
          materialOrganico: material,
          circunstanciaAcidente: circunstancia,
          agente: agente,
          equipamentoProtecao: epi,
          sorologia: sorologia,
          conduta: conduta,
          evolucaoCaso: evolucao
        });
      } catch (error) {
        console.error('Erro ao carregar catálogos:', error);
        toast.error('Erro ao carregar dados auxiliares');
      }
    };

    carregarDados();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acidenteId) {
      toast.error('Selecione um acidente base');
      return;
    }

    try {
      setIsLoading(true);
      await materialBiologicoService.criar(formData);
      toast.success('Ficha técnica registrada com sucesso!');
      navigate('/acidentes/material-biologico');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar ficha técnica');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/acidentes/material-biologico')}
            className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-emerald-600 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nova Ficha Técnica</h1>
            <p className="text-slate-500 font-medium">Preenchimento de dados clínicos de exposição biológica</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Vínculo */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
                <AlertTriangle size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Acidente de Origem</h2>
              </div>
              <div className="p-8">
                <label className="block text-sm font-bold text-slate-600 mb-2">Selecione o Acidente *</label>
                <select
                  required
                  name="acidenteId"
                  value={formData.acidenteId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700"
                >
                  <option value="">Selecione um acidente biológico recente...</option>
                  {acidentesRecentes.map(ac => (
                    <option key={ac._id} value={ac._id}>
                      {new Date(ac.dataAcidente).toLocaleDateString('pt-BR')} - {ac.descricao.substring(0, 50)}...
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">Apenas acidentes registrados como "Material Biológico" aparecem aqui.</p>
              </div>
            </section>

            {/* Exposição */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Dados da Exposição</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Tipo de Exposição</label>
                  <select name="tipoExposicao" value={formData.tipoExposicao} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.tipoExposicao?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Material Orgânico</label>
                  <select name="materialOrganico" value={formData.materialOrganico} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.materialOrganico?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Agente Causador</label>
                  <select name="agente" value={formData.agente} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.agente?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Circunstância</label>
                  <select name="circunstanciaAcidente" value={formData.circunstanciaAcidente} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.circunstanciaAcidente?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl">
                  <input type="checkbox" name="usoEPI" checked={formData.usoEPI} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded-lg" />
                  <label className="text-sm font-bold text-emerald-900 text-slate-700">O trabalhador fazia uso de EPI no momento?</label>
                </div>
              </div>
            </section>

            {/* Sorologia e Conduta */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
                <Activity size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Sorologia e Conduta</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Sorologia do Paciente Fonte</label>
                  <select name="sorologiaPaciente" value={formData.sorologiaPaciente} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.sorologia?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Sorologia do Acidentado</label>
                  <select name="sorologiaAcidentado" value={formData.sorologiaAcidentado} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.sorologia?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Conduta Adotada</label>
                  <select name="conduta" value={formData.conduta} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.conduta?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Evolução do Caso</label>
                  <select name="evolucaoCaso" value={formData.evolucaoCaso} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                    <option value="">Selecione...</option>
                    {catalogos.evolucaoCaso?.map(c => <option key={c._id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* PrEP e Reavaliação */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2">
                <Stethoscope size={20} className="text-emerald-600" />
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Acompanhamento</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="acompanhamentoPrEP" checked={formData.acompanhamentoPrEP} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded-lg" />
                    <label className="text-sm font-bold text-slate-600">Acompanhamento PrEP?</label>
                  </div>
                  {formData.acompanhamentoPrEP && (
                    <textarea name="descAcompanhamentoPrEP" value={formData.descAcompanhamentoPrEP} onChange={handleChange} rows={3} placeholder="Descreva o acompanhamento..." className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><Calendar size={16} /> Data de Reavaliação</label>
                  <input type="date" name="dataReavaliacao" value={formData.dataReavaliacao as any} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="efeitoColateralPermanente" checked={formData.efeitoColateralPermanente} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded-lg" />
                    <label className="text-sm font-bold text-slate-600">Efeito Colateral Permanente?</label>
                  </div>
                  {formData.efeitoColateralPermanente && (
                    <textarea name="descEfeitoColateralPermanente" value={formData.descEfeitoColateralPermanente} onChange={handleChange} rows={3} placeholder="Descreva os efeitos..." className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" />
                  )}
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /><span>Salvar Ficha Técnica</span></>}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

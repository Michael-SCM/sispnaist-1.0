import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.js';
import { useTrabalhadorStore } from '../../store/trabalhadorStore.js';
import { trabalhadorService } from '../../services/trabalhadorService.js';
import empresaService from '../../services/empresaService.js';
import unidadeService from '../../services/unidadeService.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import { ITrabalhador, IEmpresa, IUnidade } from '../../types/index.js';
import {
  ArrowLeft, Save, User, MapPin, Briefcase, Mail,
  Building, Calendar, Heart, Shield, Clock, AlertTriangle,
  Phone, CreditCard, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable input style
const inputCls = "w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all";
const labelCls = "block text-sm font-bold text-slate-600 mb-2";
const selectCls = `${inputCls} font-medium`;
const checkboxRowCls = "flex items-center gap-3 py-2";

export const NovoTrabalhador: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarTrabalhador } = useTrabalhadorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);

  // Catálogos
  const { itens: sexos } = useCatalogo('sexo');
  const { itens: generos } = useCatalogo('genero');
  const { itens: racas } = useCatalogo('racaCor');
  const { itens: escolaridades } = useCatalogo('escolaridade');
  const { itens: estadosCivis } = useCatalogo('estadoCivil');
  const { itens: tiposVinculo } = useCatalogo('tipoVinculo');
  const { itens: turnosTrabalho } = useCatalogo('turnoTrabalho');
  const { itens: jornadasTrabalho } = useCatalogo('jornadaTrabalho');
  const { itens: situacoesTrabalho } = useCatalogo('situacaoTrabalho');
  const { itens: tiposDeficiencia } = useCatalogo('tipoDeficiencia');
  const { itens: temposDeficiencia } = useCatalogo('tempoDeficiencia');
  const { itens: grausDeficiencia } = useCatalogo('grauDeficiencia');
  const { itens: tiposAfastamento } = useCatalogo('tipoAfastamento');

  // Checkboxes state
  const [checks, setChecks] = useState({
    deficiencia: false,
    posse: false,
    terceirizado: false,
    aposentadoria: false,
    obito: false,
    remocao: false,
    retorno: false,
    relotacao: false,
    desligamento: false,
    afastamento: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await empresaService.listarAtivas();
        setEmpresas(r1.data?.empresas || r1.empresas || []);
      } catch (e) { console.error(e); }
      try {
        const r2 = await unidadeService.listarAtivas();
        setUnidades(r2.data?.unidades || r2.unidades || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const [formData, setFormData] = useState<Partial<ITrabalhador>>({
    nome: '', cpf: '', email: '',
    sexo: '', genero: '', raca: '', escolaridade: '', estadoCivil: '',
    nomeMae: '', matricula: '', cartaoSus: '', celular: '', telefoneContato: '',
    endereco: {}, deficiencia: {},
    vinculo: { situacao: 'Ativo' },
    trabalho: {},
    historico: {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof ITrabalhador] as any), [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios (Baseado no legado PHP)
    const camposObrigatorios: { [key: string]: string } = {
      'nome': 'Nome Completo',
      'cpf': 'CPF',
      'nomeMae': 'Nome da Mãe',
      'matricula': 'Matrícula',
      'cartaoSus': 'Cartão do SUS',
      'celular': 'Celular',
      'telefoneContato': 'Telefone de Contato',
      'email': 'Email',
      'sexo': 'Sexo',
      'genero': 'Gênero',
      'raca': 'Raça',
      'escolaridade': 'Escolaridade',
      'estadoCivil': 'Estado Civil',
      'endereco.cep': 'CEP',
      'endereco.logradouro': 'Logradouro',
      'endereco.numero': 'Número',
      'endereco.complemento': 'Complemento',
      'endereco.bairro': 'Bairro',
      'endereco.cidade': 'Cidade',
      'endereco.estado': 'Estado',
      'trabalho.dataEntrada': 'Data de Entrada em Serviço',
      'vinculo.tipo': 'Tipo de Vínculo',
      'trabalho.setor': 'Setor de Trabalho',
      'trabalho.cargo': 'Cargo',
      'trabalho.funcao': 'Função',
      'trabalho.ocupacao': 'Ocupação',
      'vinculo.turno': 'Turno de Trabalho',
      'vinculo.jornada': 'Jornada de Trabalho',
      'vinculo.situacao': 'Situação do Trabalho',
    };

    for (const [path, label] of Object.entries(camposObrigatorios)) {
      const value = path.includes('.') 
        ? path.split('.').reduce((obj, key) => (obj as any)?.[key], formData)
        : formData[path as keyof ITrabalhador];
      
      if (!value) {
        toast.error(`O campo "${label}" é obrigatório`);
        return;
      }
    }

    // Validações Condicionais
    if (checks.deficiencia) {
      if (!formData.deficiencia?.tipo || !formData.deficiencia?.tempo || !formData.deficiencia?.grau) {
        toast.error('Preencha todos os campos de deficiência');
        return;
      }
    }
    if (checks.posse && !formData.trabalho?.dataPosse) {
      toast.error('Data da posse é obrigatória');
      return;
    }
    if (checks.terceirizado && !formData.trabalho?.empresaTerceirizada) {
      toast.error('Nome da empresa terceirizada é obrigatório');
      return;
    }
    if (checks.aposentadoria && !formData.historico?.dataAposentadoria) {
      toast.error('Data da aposentadoria é obrigatória');
      return;
    }
    if (checks.obito && !formData.historico?.dataObito) {
      toast.error('Data do óbito é obrigatória');
      return;
    }
    if (checks.remocao) {
      if (!formData.historico?.dataRemocao || !formData.historico?.novoServico) {
        toast.error('Data da remoção e novo serviço são obrigatórios');
        return;
      }
    }
    if (checks.retorno && !formData.historico?.dataRetorno) {
      toast.error('Data de retorno é obrigatória');
      return;
    }
    if (checks.relotacao && !formData.historico?.dataRelotacao) {
      toast.error('Data da relotação é obrigatória');
      return;
    }
    if (checks.desligamento && !formData.historico?.dataDesligamento) {
      toast.error('Data do desligamento é obrigatória');
      return;
    }
    if (checks.afastamento) {
      if (!formData.historico?.dataAfastamento || !formData.historico?.tipoAfastamento) {
        toast.error('Data do afastamento e tipo de afastamento são obrigatórios');
        return;
      }
    }

    try {
      setIsLoading(true);
      const novo = await trabalhadorService.criar(formData);
      adicionarTrabalhador(novo);
      toast.success('Trabalhador cadastrado com sucesso');
      navigate('/trabalhadores');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar trabalhador');
    } finally {
      setIsLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
      <Icon size={20} className="text-blue-600" />
      <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h2>
    </div>
  );

  const renderSelect = (name: string, label: string, items: any[], value: string) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select name={name} value={value} onChange={handleChange} className={selectCls}>
        <option value="">Selecione...</option>
        {items.map((i) => <option key={i.nome} value={i.nome}>{i.nome}</option>)}
      </select>
    </div>
  );

  const renderInput = (name: string, label: string, value: string, opts?: { required?: boolean; type?: string; placeholder?: string }) => (
    <div>
      <label className={labelCls}>{label}{opts?.required ? ' *' : ''}</label>
      <input
        type={opts?.type || 'text'}
        required={opts?.required}
        name={name}
        value={value}
        onChange={handleChange}
        className={inputCls}
        placeholder={opts?.placeholder}
      />
    </div>
  );

  const renderCheckDate = (
    checkKey: keyof typeof checks, label: string, dateName: string, dateValue: string, extra?: React.ReactNode
  ) => (
    <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
      <label className={checkboxRowCls}>
        <input
          type="checkbox"
          checked={checks[checkKey]}
          onChange={(e) => setChecks(p => ({ ...p, [checkKey]: e.target.checked }))}
          className="w-5 h-5 rounded-lg text-blue-600"
        />
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </label>
      {checks[checkKey] && (
        <div className="pl-8 space-y-3">
          <div>
            <label className={labelCls}>Data *</label>
            <input type="date" name={dateName} value={dateValue} onChange={handleChange} className={inputCls} />
          </div>
          {extra}
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/trabalhadores')} className="p-3 hover:bg-blue-50 rounded-2xl transition-all text-blue-600 active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Novo Trabalhador</h1>
            <p className="text-slate-500 font-medium">Cadastre um novo funcionário no sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ═══════════ INFORMAÇÕES GERAIS ═══════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={User} title="Informações Gerais" />
            <div className="p-8 space-y-6">
              {/* CPF + Nome + Nome da Mãe */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderInput('cpf', 'CPF', formData.cpf || '', { required: true, placeholder: '000.000.000-00' })}
                {renderInput('nome', 'Nome Completo', formData.nome || '', { required: true, placeholder: 'Nome completo do trabalhador' })}
                {renderInput('nomeMae', 'Nome da Mãe', formData.nomeMae || '', { required: true })}
              </div>
              {/* Matrícula, Cartão SUS, Celular, Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {renderInput('matricula', 'Matrícula', formData.matricula || '', { required: true })}
                {renderInput('cartaoSus', 'Cartão do SUS', formData.cartaoSus || '', { required: true })}
                {renderInput('celular', 'Celular', formData.celular || '', { required: true })}
                {renderInput('telefoneContato', 'Outro Contato', formData.telefoneContato || '', { required: true })}
                {renderInput('dataNascimento', 'Data de Nascimento', formData.dataNascimento ? String(formData.dataNascimento).split('T')[0] : '', { type: 'date' })}
              </div>
              {/* Email */}
              <div>
                <label className={labelCls}><Mail size={14} className="inline mr-1" />Email *</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputCls} placeholder="email@exemplo.com" />
              </div>
              {/* Sexo, Gênero, Raça, Escolaridade, Estado Civil */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {renderSelect('sexo', 'Sexo *', sexos, formData.sexo || '')}
                {renderSelect('genero', 'Gênero *', generos, formData.genero || '')}
                {renderSelect('raca', 'Raça *', racas, formData.raca || '')}
                {renderSelect('escolaridade', 'Escolaridade *', escolaridades, formData.escolaridade || '')}
                {renderSelect('estadoCivil', 'Estado Civil *', estadosCivis, formData.estadoCivil || '')}
              </div>

              {/* Deficiência */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <label className={checkboxRowCls}>
                  <input type="checkbox" checked={checks.deficiencia} onChange={e => setChecks(p => ({ ...p, deficiencia: e.target.checked }))} className="w-5 h-5 rounded-lg text-blue-600" />
                  <span className="text-sm font-bold text-slate-600">Deficiente?</span>
                </label>
                {checks.deficiencia && (
                  <div className="pl-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderSelect('deficiencia.tipo', 'Tipo *', tiposDeficiencia, formData.deficiencia?.tipo || '')}
                    {renderSelect('deficiencia.tempo', 'Tempo *', temposDeficiencia, formData.deficiencia?.tempo || '')}
                    {renderSelect('deficiencia.grau', 'Grau *', grausDeficiencia, formData.deficiencia?.grau || '')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════ ENDEREÇO ═══════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={MapPin} title="Endereço Residencial" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderInput('endereco.cep', 'CEP', formData.endereco?.cep || '', { required: true })}
              <div className="md:col-span-2">
                {renderInput('endereco.logradouro', 'Logradouro', formData.endereco?.logradouro || '', { required: true })}
              </div>
              {renderInput('endereco.numero', 'Número', formData.endereco?.numero || '', { required: true })}
              {renderInput('endereco.complemento', 'Complemento', formData.endereco?.complemento || '', { required: true })}
              {renderInput('endereco.bairro', 'Bairro', formData.endereco?.bairro || '', { required: true })}
              {renderInput('endereco.cidade', 'Cidade', formData.endereco?.cidade || '', { required: true })}
              {renderInput('endereco.estado', 'Estado (UF)', formData.endereco?.estado || '', { required: true })}
            </div>
          </div>

          {/* ═══════════ SERVIÇO ═══════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Building} title="Serviço" />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Empresa</label>
                  <select name="empresa" value={formData.empresa || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {empresas.map(e => <option key={e._id} value={e._id}>{e.razaoSocial}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Unidade</label>
                  <select name="unidade" value={formData.unidade || ''} onChange={handleChange} className={selectCls}>
                    <option value="">Selecione...</option>
                    {unidades.map(u => <option key={u._id} value={u._id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Posse */}
              {renderCheckDate('posse', 'Tomou posse?', 'trabalho.dataPosse', formData.trabalho?.dataPosse || '')}

              {/* Terceirizado CLT */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <label className={checkboxRowCls}>
                  <input type="checkbox" checked={checks.terceirizado} onChange={e => setChecks(p => ({ ...p, terceirizado: e.target.checked }))} className="w-5 h-5 rounded-lg text-blue-600" />
                  <span className="text-sm font-bold text-slate-600">Terceirizado CLT?</span>
                </label>
                {checks.terceirizado && (
                  <div className="pl-8">
                    {renderInput('trabalho.empresaTerceirizada', 'Nome da Empresa Terceirizada *', formData.trabalho?.empresaTerceirizada || '')}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Data de Entrada em Serviço *</label>
                  <input type="date" name="trabalho.dataEntrada" value={formData.trabalho?.dataEntrada || ''} onChange={handleChange} className={inputCls} />
                </div>
                {renderSelect('vinculo.tipo', 'Tipo de Vínculo *', tiposVinculo, formData.vinculo?.tipo || '')}
              </div>
            </div>
          </div>

          {/* ═══════════ TRABALHO ═══════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={Briefcase} title="Trabalho" />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderInput('trabalho.setor', 'Setor de Trabalho *', formData.trabalho?.setor || '')}
                {renderInput('trabalho.cargo', 'Cargo *', formData.trabalho?.cargo || '')}
                {renderInput('trabalho.funcao', 'Função *', formData.trabalho?.funcao || '')}
              </div>
              {renderInput('trabalho.ocupacao', 'Ocupação *', formData.trabalho?.ocupacao || '')}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderSelect('vinculo.turno', 'Turno de Trabalho *', turnosTrabalho, formData.vinculo?.turno || '')}
                {renderSelect('vinculo.jornada', 'Jornada de Trabalho *', jornadasTrabalho, formData.vinculo?.jornada || '')}
                {renderSelect('vinculo.situacao', 'Situação do Trabalho *', situacoesTrabalho, formData.vinculo?.situacao || '')}
              </div>
            </div>
          </div>

          {/* ═══════════ SITUAÇÕES ═══════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <SectionHeader icon={AlertTriangle} title="Situações" />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderCheckDate('aposentadoria', 'Se aposentou?', 'historico.dataAposentadoria', formData.historico?.dataAposentadoria || '')}
              {renderCheckDate('obito', 'Foi a óbito?', 'historico.dataObito', formData.historico?.dataObito || '')}
              {renderCheckDate('remocao', 'Foi removido?', 'historico.dataRemocao', formData.historico?.dataRemocao || '',
                <div>
                  {renderInput('historico.novoServico', 'Novo serviço pós-remoção *', formData.historico?.novoServico || '')}
                </div>
              )}
              {renderCheckDate('retorno', 'Retornou ao serviço?', 'historico.dataRetorno', formData.historico?.dataRetorno || '')}
              {renderCheckDate('relotacao', 'Foi relotado?', 'historico.dataRelotacao', formData.historico?.dataRelotacao || '')}
              {renderCheckDate('desligamento', 'Foi desligado?', 'historico.dataDesligamento', formData.historico?.dataDesligamento || '')}
              {renderCheckDate('afastamento', 'Foi afastado?', 'historico.dataAfastamento', formData.historico?.dataAfastamento || '',
                renderSelect('historico.tipoAfastamento', 'Tipo de Afastamento *', tiposAfastamento, formData.historico?.tipoAfastamento || '')
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} />
                  <span>Cadastrar Trabalhador</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default NovoTrabalhador;

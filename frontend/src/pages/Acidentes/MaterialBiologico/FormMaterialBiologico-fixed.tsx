import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAcidenteMaterialBiologicoStore from '../../../store/acidenteMaterialBiologicoStore';
import { FormFields } from '../../../components/FormFields';
import { IAcidenteMaterialBiologico } from '../../../types/index';

const FormMaterialBiologico = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    atual, 
    criar, 
    atualizar, 
    obter, 
    carregando, 
    erro,
    reset 
  } = useAcidenteMaterialBiologicoStore();

  const [formData, setFormData] = useState<Partial<IAcidenteMaterialBiologico>>({});
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      obter(id);
    }
    return () => {
      reset();
    };
  }, [id]);

  useEffect(() => {
    if (atual && isEdit) {
      setFormData(atual);
    }
  }, [atual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      await atualizar(id, formData as IAcidenteMaterialBiologico);
    } else {
      await criar(formData as IAcidenteMaterialBiologico);
    }
    navigate('/acidentes/material-biologico');
  };

  const handleChange = (field: string, value: any) => {
    // ✅ Fixed: Preserve native types (boolean for checkboxes, string for text/select/date)
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEdit ? 'Editar Material Biológico' : 'Novo Material Biológico'}
        </h2>
        <button
          onClick={() => navigate('/acidentes/material-biologico')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <FormFields
            label="Acidente ID *"
            type="text"
            value={formData.acidenteId || ''}
            onChange={(e) => handleChange('acidenteId', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFields
            label="Tipo de Exposição *"
            type="select"
            value={formData.tipoExposicao || ''}
            onChange={(e) => handleChange('tipoExposicao', e.target.value)}
            required
            options={[
              { value: '', label: 'Selecione...' },
              { value: 'percutaneous', label: 'Percutânea (ag. oca)' },
              { value: 'mucosa', label: 'Mucosa (olhos, boca)' },
              { value: 'pele', label: 'Pele íntegra' },
              { value: 'inhalacao', label: 'Inalação' }
            ]}
          />
          
          <FormFields
            label="Material Orgânico"
            type="text"
            value={formData.materialOrganico || ''}
            onChange={(e) => handleChange('materialOrganico', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFields
            label="Circunstância"
            type="textarea"
            value={formData.circunstanciaAcidente || ''}
            onChange={(e) => handleChange('circunstanciaAcidente', e.target.value)}
            rows={3}
          />
          
          <FormFields
            label="Agente"
            type="text"
            value={formData.agente || ''}
            onChange={(e) => handleChange('agente', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFields
            label="Equipamento de Proteção"
            type="text"
            value={formData.equipamentoProtecao || ''}
            onChange={(e) => handleChange('equipamentoProtecao', e.target.value)}
          />
          
          <FormFields
            label="Conduta Adotada"
            type="textarea"
            value={formData.conduta || ''}
            onChange={(e) => handleChange('conduta', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormFields
            label="Uso de EPI"
            type="checkbox"
            checked={formData.usoEpi || false}
            onChange={(e) => handleChange('usoEpi', e.target.checked)}
          />
          
          <FormFields
            label="Sorologia Fonte"
            type="checkbox"
            checked={formData.sorologiaFonte || false}
            onChange={(e) => handleChange('sorologiaFonte', e.target.checked)}
          />
          
          <FormFields
            label="Acompanhamento PREP"
            type="checkbox"
            checked={formData.acompanhamentoPrep || false}
            onChange={(e) => handleChange('acompanhamentoPrep', e.target.checked)}
          />
          
          <FormFields
            label="Efeito Colateral"
            type="checkbox"
            checked={formData.efeitoColateralPermanece || false}
            onChange={(e) => handleChange('efeitoColateralPermanece', e.target.checked)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFields
            label="Sorologia Paciente"
            type="text"
            value={formData.sorologiaPaciente || ''}
            onChange={(e) => handleChange('sorologiaPaciente', e.target.value)}
          />
          
          <FormFields
            label="Sorologia Acidentado"
            type="text"
            value={formData.sorologiaAcidentado || ''}
            onChange={(e) => handleChange('sorologiaAcidentado', e.target.value)}
          />
        </div>

        <FormFields
          label="Evolução"
          type="textarea"
          value={formData.evolucao || ''}
          onChange={(e) => handleChange('evolucao', e.target.value)}
          rows={4}
        />

        <FormFields
          label="Descrição Acompanhamento PREP"
          type="textarea"
          value={formData.descricaoAcompanhamentoPrep || ''}
          onChange={(e) => handleChange('descricaoAcompanhamentoPrep', e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFields
            label="Encaminhamento"
            type="text"
            value={formData.encaminhamento || ''}
            onChange={(e) => handleChange('encaminhamento', e.target.value)}
          />
          
          <FormFields
            label="Data Reavaliação"
            type="date"
            value={formData.dataReavaliacao || ''}
            onChange={(e) => handleChange('dataReavaliacao', e.target.value)}
          />
        </div>

        <FormFields
          label="Descrição Efeito Colateral"
          type="textarea"
          value={formData.descricaoEfeitoColateral || ''}
          onChange={(e) => handleChange('descricaoEfeitoColateral', e.target.value)}
          rows={3}
        />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={carregando}
            className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {carregando ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/acidentes/material-biologico')}
            className="flex-1 bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export { FormMaterialBiologico };
export default FormMaterialBiologico;


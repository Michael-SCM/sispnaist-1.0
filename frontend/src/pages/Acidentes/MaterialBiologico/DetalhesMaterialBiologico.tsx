import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAcidenteMaterialBiologicoStore from '../../../store/acidenteMaterialBiologicoStore';
import { IAcidenteMaterialBiologico } from '../../../types/index';
import { formatDateBR } from '../../../utils/formHelpers';
import FormFields from '../../../components/FormFields';

const DetalhesMaterialBiologico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { atual, obter, carregando, erro } = useAcidenteMaterialBiologicoStore();

  useEffect(() => {
    if (id) {
      obter(id);
    }
  }, [id]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!atual || erro) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {erro || 'Registro não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Detalhes - Material Biológico</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/acidentes/material-biologico/editar/${atual._id}`)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Editar
          </button>
          <button
            onClick={() => navigate('/acidentes/material-biologico')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1 - Dados principais */}
        <div className="space-y-6">
          <FormFields
            label="Acidente ID"
            type="text"
            value={atual.acidenteId || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Tipo de Exposição"
            type="text"
            value={atual.tipoExposicao || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Material Orgânico"
            type="text"
            value={atual.materialOrganico || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Agente"
            type="text"
            value={atual.agente || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Equipamento de Proteção"
            type="text"
            value={atual.equipamentoProtecao || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Data Reavaliação"
            type="text"
            value={atual.dataReavaliacao ? formatDateBR(atual.dataReavaliacao) : 'N/A'}
            disabled
          />
        </div>

        {/* Coluna 2 - Checkboxes e sorologias */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded border-2 ${atual.usoEpi ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-400'}`}></span>
              <span>Uso de EPI</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded border-2 ${atual.sorologiaFonte ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-400'}`}></span>
              <span>Sorologia Fonte</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded border-2 ${atual.acompanhamentoPrep ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-400'}`}></span>
              <span>Acompanhamento PREP</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded border-2 ${atual.efeitoColateralPermanece ? 'bg-orange-500 border-orange-600' : 'bg-gray-200 border-gray-400'}`}></span>
              <span>Efeito Colateral</span>
            </div>
          </div>

          <FormFields
            label="Sorologia Paciente"
            type="text"
            value={atual.sorologiaPaciente || 'N/A'}
            disabled
          />
          
          <FormFields
            label="Sorologia Acidentado"
            type="text"
            value={atual.sorologiaAcidentado || 'N/A'}
            disabled
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-900">Histórico</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Criado:</span> {formatDateBR(atual.dataCriacao)}</p>
              {atual.dataAtualizacao && (
                <p><span className="font-medium">Atualizado:</span> {formatDateBR(atual.dataAtualizacao)}</p>
              )}
              <p><span className="font-medium">Status:</span> {atual.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de texto grande */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Circunstância do Acidente</h4>
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg min-h-[100px]">
          {atual.circunstanciaAcidente || 'Não informado'}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Conduta Adotada</h4>
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed p-4 bg-blue-50 rounded-lg min-h-[100px]">
          {atual.conduta || 'Não informado'}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Evolução</h4>
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed p-4 bg-green-50 rounded-lg min-h-[100px]">
          {atual.evolucao || 'Não informado'}
        </p>
      </div>

      {atual.descricaoAcompanhamentoPrep && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Acompanhamento PREP</h4>
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed p-4 bg-indigo-50 rounded-lg min-h-[80px]">
            {atual.descricaoAcompanhamentoPrep}
          </p>
        </div>
      )}

      {atual.descricaoEfeitoColateral && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Efeito Colateral</h4>
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed p-4 bg-orange-50 rounded-lg min-h-[80px]">
            {atual.descricaoEfeitoColateral}
          </p>
        </div>
      )}
    </div>
  );
};

export { DetalhesMaterialBiologico };
export default DetalhesMaterialBiologico;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from '../../hooks/useForm.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import { useAcidenteMaterialBiologicoStore } from '../../store/acidenteMaterialBiologicoStore.js';
import FormFields from '../../components/FormFields.js';
import { MainLayout } from '../../layouts/MainLayout.js';
import { Header } from '../../components/Header.js';
import { IAcidenteMaterialBiologico } from '../../types/index.js';

interface FormData {
  acidenteId: string;
  tipoExposicaoId: string;
  materialOrganicoId: string;
  circunstanciaAcidenteId: string;
  agenteId: string;
  equipamentoProtecaoId?: string;
  usoEpi: boolean;
  sorologiaFonte: boolean;
  acompanhamentoPrep: boolean;
  dsAcompanhamentoPrep?: string;
  dsEncaminhamento?: string;
  dtReavaliacao?: string;
  efeitoColateralPermanece: boolean;
  dsEfeitoColateralPermanece?: string;
}

const FormAcidenteMaterialBiologico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { criar, atualizar, buscarPorId, carregando } = useAcidenteMaterialBiologicoStore();
  
  const [formData, setFormData, handleChange, setFieldValue] = useForm<FormData>({
    acidenteId: '',
    tipoExposicaoId: '',
    materialOrganicoId: '',
    circunstanciaAcidenteId: '',
    agenteId: '',
    equipamentoProtecaoId: '',
    usoEpi: false,
    sorologiaFonte: false,
    acompanhamentoPrep: false,
    dsAcompanhamentoPrep: '',
    dsEncaminhamento: '',
    dtReavaliacao: '',
    efeitoColateralPermanece: false,
    dsEfeitoColateralPermanece: '',
  });

  // Catálogos
  const { catalogos: tipoExposicoes, carregando: carregandoTipos } = useCatalogo('tipoExposicao');
  const { catalogos: materiais } = useCatalogo('materialOrganico');
  const { catalogos: circunstancias } = useCatalogo('circunstanciaAcidente');
  const { catalogos: agentes } = useCatalogo('agente');
  const { catalogos: eqpProtecao } = useCatalogo('equipamentoProtecao');
  const { catalogos: condutas } = useCatalogo('conduta');
  const { catalogos: evolucoes } = useCatalogo('evolucao');

  useEffect(() => {
    if (isEdit && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setFormData({
            acidenteId: data.acidenteId?._id || '',
            tipoExposicaoId: data.tipoExposicaoId?._id || '',
            materialOrganicoId: data.materialOrganicoId?._id || '',
            circunstanciaAcidenteId: data.circunstanciaAcidenteId?._id || '',
            agenteId: data.agenteId?._id || '',
            equipamentoProtecaoId: data.equipamentoProtecaoId?._id || '',
            usoEpi: data.usoEpi,
            sorologiaFonte: data.sorologiaFonte,
            acompanhamentoPrep: data.acompanhamentoPrep,
            dsAcompanhamentoPrep: data.dsAcompanhamentoPrep || '',
            dsEncaminhamento: data.dsEncaminhamento || '',
            dtReavaliacao: data.dtReavaliacao || '',
            efeitoColateralPermanece: data.efeitoColateralPermanece,
            dsEfeitoColateralPermanece: data.dsEfeitoColateralPermanece || '',
          });
        }
      });
    }
  }, [id, isEdit, buscarPorId, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && id) {
        await atualizar(id, formData);
        toast.success('Atualizado com sucesso!');
      } else {
        await criar(formData);
        toast.success('Criado com sucesso!');
      }
      navigate('/acidentes-material-biologicos');
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <MainLayout>
      <Header title={isEdit ? 'Editar Acidente Biológico' : 'Novo Acidente Biológico'} />
      
      <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormFields.Select
                label="Tipo Exposição *"
                name="tipoExposicaoId"
                value={formData.tipoExposicaoId}
                onChange={handleChange}
                options={tipoExposicoes.map(c => ({ value: c._id!, label: c.nome }))}
                disabled={carregandoTipos || carregando}
                required
              />
              
              <FormFields.Select
                label="Material Orgânico *"
                name="materialOrganicoId"
                value={formData.materialOrganicoId}
                onChange={handleChange}
                options={materiais.map(c => ({ value: c._id!, label: c.nome }))}
                required
              />
              
              <FormFields.Select
                label="Circunstância *"
                name="circunstanciaAcidenteId"
                value={formData.circunstanciaAcidenteId}
                onChange={handleChange}
                options={circunstancias.map(c => ({ value: c._id!, label: c.nome }))}
                required
              />
              
              <FormFields.Select
                label="Agente *"
                name="agenteId"
                value={formData.agenteId}
                onChange={handleChange}
                options={agentes.map(c => ({ value: c._id!, label: c.nome }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormFields.Select
                label="Equipamento Proteção"
                name="equipamentoProtecaoId"
                value={formData.equipamentoProtecaoId}
                onChange={handleChange}
                options={eqpProtecao.map(c => ({ value: c._id!, label: c.nome }))}
              />
              
              <FormFields.DatePicker
                label="Data Reavaliação"
                name="dtReavaliacao"
                value={formData.dtReavaliacao}
                onChange={(value) => setFieldValue('dtReavaliacao', value)}
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Usou EPI?</span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={formData.usoEpi}
                  onChange={(e) => setFieldValue('usoEpi', e.target.checked)}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Sorologia da Fonte?</span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={formData.sorologiaFonte}
                  onChange={(e) => setFieldValue('sorologiaFonte', e.target.checked)}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Acompanhamento PrEP?</span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={formData.acompanhamentoPrep}
                  onChange={(e) => setFieldValue('acompanhamentoPrep', e.target.checked)}
                />
              </label>
            </div>

            {formData.acompanhamentoPrep && (
              <FormFields.TextArea
                label="Descrição Acompanhamento PrEP"
                name="dsAcompanhamentoPrep"
                value={formData.dsAcompanhamentoPrep}
                onChange={handleChange}
                rows={3}
              />
            )}

            <FormFields.TextArea
              label="Encaminhamento"
              name="dsEncaminhamento"
              value={formData.dsEncaminhamento}
              onChange={handleChange}
              rows={3}
            />

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Efeito Colateral Permanece?</span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={formData.efeitoColateralPermanece}
                  onChange={(e) => setFieldValue('efeitoColateralPermanece', e.target.checked)}
                />
              </label>
            </div>

            {formData.efeitoColateralPermanece && (
              <FormFields.TextArea
                label="Descrição Efeito Colateral"
                name="dsEfeitoColateralPermanece"
                value={formData.dsEfeitoColateralPermanece}
                onChange={handleChange}
                rows={3}
              />
            )}

            <div className="card-actions justify-end space-x-4 pt-6">
              <button 
                type="button" 
                className="btn btn-ghost"
                onClick={() => navigate('/acidentes-material-biologicos')}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormAcidenteMaterialBiologico;


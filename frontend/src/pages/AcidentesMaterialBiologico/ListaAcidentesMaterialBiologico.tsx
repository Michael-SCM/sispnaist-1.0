import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAcidenteMaterialBiologicoStore } from '../../store/acidenteMaterialBiologicoStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import DataTable from '../../components/DataTable.js';
import { Header } from '../../components/Header.js';
import { MainLayout } from '../../layouts/MainLayout.js';
import { 
  IAcidenteMaterialBiologico, 
  ITrabalhador 
} from '../../types/index.js';

const ListaAcidentesMaterialBiologico: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trabalhadorId = searchParams.get('trabalhadorId');
  
  const { perfil } = useAuthStore();
  const { acidentes, buscarTodos, carregando, erro } = useAcidenteMaterialBiologicoStore();
  
  // Filtros de catálogo
  const { catalogos: tipoExposicoes } = useCatalogo('tipoExposicao');
  const { catalogos: materiaisOrganicos } = useCatalogo('materialOrganico');
  
  const columns = [
    { key: 'dataAcidente', label: 'Data Acidente', render: (row: IAcidenteMaterialBiologico) => row.acidente?.dataAcidente?.split('T')[0] || '-' },
    { key: 'tipoExposicao', label: 'Tipo Exposição', render: (row) => row.tipoExposicao?.nome || '-' },
    { key: 'materialOrganico', label: 'Material', render: (row) => row.materialOrganico?.nome || '-' },
    { key: 'usoEpi', label: 'Usou EPI?', render: (row) => row.usoEpi ? 'Sim' : 'Não' },
    { key: 'sorologiaFonte', label: 'Sorologia Fonte', render: (row) => row.sorologiaFonte ? 'Sim' : 'Não' },
    { key: 'status', label: 'Status', render: (row) => row.ativo ? 'Ativo' : 'Inativo' },
    {
      key: 'actions',
      label: 'Ações',
      render: (row: IAcidenteMaterialBiologico) => (
        <div className="flex gap-2">
          <button 
            className="btn btn-sm btn-info"
            onClick={() => navigate(`/acidentes-material-biologicos/${row._id}/editar`)}
          >
            Editar
          </button>
          <button 
            className="btn btn-sm btn-warning"
            onClick={() => navigate(`/acidentes-material-biologicos/${row._id}`)}
          >
            Detalhes
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    buscarTodos({ trabalhadorId: trabalhadorId || undefined });
  }, [trabalhadorId]);

  if (erro) {
    toast.error(erro);
  }

  return (
    <MainLayout>
      <Header title="Acidentes com Material Biológico" />
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between mb-6">
            <h2 className="card-title">
              {trabalhadorId ? 'Acidentes Biológicos do Trabalhador' : 'Todos os Acidentes Biológicos'}
            </h2>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/acidentes-material-biologicos/novo')}
              disabled={carregando}
            >
              Novo Acidente Biológico
            </button>
          </div>

          <DataTable 
            data={acidentes} 
            columns={columns} 
            loading={carregando}
            emptyMessage="Nenhum acidente biológico encontrado"
            pageSize={10}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ListaAcidentesMaterialBiologico;


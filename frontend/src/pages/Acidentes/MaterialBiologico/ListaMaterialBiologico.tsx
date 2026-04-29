import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAcidenteMaterialBiologicoStore from '../../../store/acidenteMaterialBiologicoStore';
import DataTable from '../../../components/DataTable';
import FormFields from '../../../components/FormFields';
import { IAcidenteMaterialBiologico } from '../../../types/index';
import { formatDateBR } from '../../../utils/formHelpers';

const ListaMaterialBiologico: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    registros, 
    total, 
    carregando, 
    page, 
    limit, 
    listar, 
    erro 
  } = useAcidenteMaterialBiologicoStore();

  const [filtros, setFiltros] = useState({
    tipoExposicao: '',
    agente: '',
  });

  useEffect(() => {
    const currentPage = searchParams.get('page') || '1';
    listar(Number(currentPage), limit, filtros);
  }, [searchParams.get('page'), filtros]);

  const handleEdit = (id: string) => {
    navigate(`/acidentes/material-biologico/editar/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/acidentes/material-biologico/detalhes/${id}`);
  };

  const columns = [
    { key: '_id', header: 'ID', width: '15%' },
    { key: 'tipoExposicao', header: 'Tipo Exposição', width: '20%' },
    { key: 'agente', header: 'Agente', width: '20%' },
    { 
      key: 'dataCriacao', 
      header: 'Criado em', 
      render: (item: IAcidenteMaterialBiologico) => formatDateBR(item.dataCriacao),
      width: '15%'
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: IAcidenteMaterialBiologico) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleView(item._id!)}
            className="text-blue-500 hover:underline text-sm"
          >
            Ver
          </button>
          <button 
            onClick={() => handleEdit(item._id!)}
            className="text-green-500 hover:underline text-sm"
          >
            Editar
          </button>
        </div>
      ),
      width: '15%'
    }
  ];

  const handleFiltroChange = (field: string, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Acidentes Material Biológico</h2>
        <button
          onClick={() => navigate('/acidentes/material-biologico/novo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Novo Registro
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormFields 
            label="Tipo de Exposição"
            type="select"
            value={filtros.tipoExposicao}
            onChange={(e) => handleFiltroChange('tipoExposicao', e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'percutaneous', label: 'Percutânea' },
              { value: 'mucosa', label: 'Mucosa' },
              { value: 'pele', label: 'Pele íntegra' }
            ]}
          />
          <FormFields 
            label="Agente"
            type="text"
            value={filtros.agente}
            onChange={(e) => handleFiltroChange('agente', e.target.value)}
          />
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {erro}
        </div>
      )}

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={registros}
        total={total}
        page={page}
        limit={limit}
        loading={carregando}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export { ListaMaterialBiologico };
export default ListaMaterialBiologico;


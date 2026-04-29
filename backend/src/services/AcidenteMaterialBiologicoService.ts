import AcidenteMaterialBiologico from '../models/AcidenteMaterialBiologico.js';
import SorologiaPaciente from '../models/SorologiaPaciente.js';
import SorologiaAcidentado from '../models/SorologiaAcidentado.js';
import Acidente from '../models/Acidente.js';
import Catalogo from '../models/Catalogo.js';

export class AcidenteMaterialBiologicoService {
  async criar(data: any) {
    const acidenteMaterialBiologico = new AcidenteMaterialBiologico(data);
    await acidenteMaterialBiologico.save();

    // Atualizar ref no Acidente
    await Acidente.findByIdAndUpdate(data.acidenteId, { 
      $set: { acidenteMaterialBiologicoId: acidenteMaterialBiologico._id } 
    });

    return this.obterPorId(acidenteMaterialBiologico._id!);
  }

  async obterPorId(id: string, populate = true) {
    const query = AcidenteMaterialBiologico.findById(id);
    if (populate) {
      query.populate([
        { path: 'acidenteId', select: 'dataAcidente tipoAcidente trabalhadorId' },
        { path: 'tipoExposicaoId', select: 'nome' },
        { path: 'materialOrganicoId', select: 'nome' },
        { path: 'circunstanciaAcidenteId', select: 'nome' },
        { path: 'agenteId', select: 'nome' },
        { path: 'equipamentoProtecaoId', select: 'nome' },
        { path: 'condutaId', select: 'nome' },
        { path: 'evolucaoId', select: 'nome' },
        { path: 'sorologiaPacienteId' },
        { path: 'sorologiaAcidentadoId' },
      ]);
    }
    return query.lean();
  }

  async listar(filtros: any = {}) {
    const query = AcidenteMaterialBiologico.find({ ativo: true, ...filtros })
      .populate('acidenteId', 'dataAcidente tipoAcidente trabalhadorId')
      .populate([
        'tipoExposicaoId', 'materialOrganicoId', 'circunstanciaAcidenteId', 
        'agenteId', 'equipamentoProtecaoId', 'condutaId', 'evolucaoId'
      ])
      .sort({ createdAt: -1 });

    if (filtros.acidenteId) query.where({ acidenteId: filtros.acidenteId });
    if (filtros.trabalhadorId) query.where({ 'acidenteId.trabalhadorId': filtros.trabalhadorId });

    return query.lean();
  }

  async atualizar(id: string, data: any) {
    const updated = await AcidenteMaterialBiologico.findByIdAndUpdate(
      id, 
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      'acidenteId', 'tipoExposicaoId', 'materialOrganicoId', 'circunstanciaAcidenteId',
      'agenteId', 'equipamentoProtecaoId', 'condutaId', 'evolucaoId',
      'sorologiaPacienteId', 'sorologiaAcidentadoId'
    ]);

    return updated;
  }

  async deletar(id: string) {
    return AcidenteMaterialBiologico.findByIdAndUpdate(id, { ativo: false });
  }

  async obterSorologiaPaciente(id: string) {
    return SorologiaPaciente.findById(id).lean();
  }

  async criarSorologiaPaciente(data: any) {
    const sorologia = new SorologiaPaciente(data);
    await sorologia.save();
    return sorologia;
  }

  async obterSorologiaAcidentado(id: string) {
    return SorologiaAcidentado.findById(id).lean();
  }

  async criarSorologiaAcidentado(data: any) {
    const sorologia = new SorologiaAcidentado(data);
    await sorologia.save();
    return sorologia;
  }
}

export default new AcidenteMaterialBiologicoService();


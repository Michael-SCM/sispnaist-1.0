import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model genérico para tabelas auxiliares/catalogos do sistema PHP original.
 * Equivalente a: tb_sexo, tb_genero, tb_raca_cor, tb_escolaridade, tb_estado_civil,
 * tb_tipo_sanguineo, tb_tipo_acidente, tb_tipo_trauma, tb_parte_corpo, etc.
 * 
 * Todas seguem o mesmo padrão: id_pk_{entidade}, nm_{entidade}, in_ativo, sigla/descricao
 */

export interface ICatalogoItem extends Document {
  entidade: string;        // 'sexo', 'genero', 'racaCor', 'escolaridade', etc.
  nome: string;            // nome do item (ex: 'Masculino', 'Feminino')
  sigla?: string;          // sigla opcional (ex: 'M', 'F')
  descricao?: string;      // descrição mais detalhada
  ativo: boolean;
  ordem?: number;          // ordem de exibição
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const CatalogoSchema = new Schema<ICatalogoItem>(
  {
    entidade: {
      type: String,
      required: true,
      index: true,
      enum: [
        'sexo', 'genero', 'racaCor', 'escolaridade', 'estadoCivil',
        'tipoSanguineo', 'estadoVacinal', 'tipoDeficiencia', 'grauDeficiencia',
        'tempoDeficiencia', 'tipoAcidente', 'tipoTrauma', 'causadorTrauma',
        'parteCorpo', 'circunstanciaAcidente', 'tipoExposicao', 'agente',
        'conduta', 'desfecho', 'evolucaoAcidentado', 'evolucaoCaso',
        'materialOrganico', 'sorologiaAcidentado', 'sorologiaPaciente',
        'doencaBase', 'tipoViolencia', 'tipoViolenciaSexual', 'motivoViolencia',
        'meioAgressao', 'tipoAutorViolencia', 'jornadaTrabalho', 'turnoTrabalho',
        'situacaoTrabalho', 'tipoAfastamento', 'motivoAfastamento',
        'motivoReadaptacao', 'tempoReadaptacao',
        'regimeAcompanhamento', 'equipamentoProtecao', 'tipoVinculo',
        'outroVinculo', 'funcao', 'grauSatisfacao', 'bairro', 'tipoDroga',
        'padraoEmail', 'parametro', 'parentesco', 'sorologia'
      ]
    },
    nome: { type: String, required: true, trim: true },
    sigla: { type: String, trim: true },
    descricao: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'catalogos'
  }
);

// Índice composto para busca rápida por entidade + ativo
CatalogoSchema.index({ entidade: 1, ativo: 1 });
// Índice para ordenação
CatalogoSchema.index({ entidade: 1, ordem: 1 });

export default mongoose.model<ICatalogoItem>('Catalogo', CatalogoSchema);


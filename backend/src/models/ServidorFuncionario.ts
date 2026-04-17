import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para servidores/funcionários públicos.
 * Equivalente a: tb_servidor_funcionario no PHP original.
 */

export interface IServidorFuncionario extends Document {
  trabalhadorId: string;      // link com Trabalhador
  matriculaFuncional: string;
  dataPosse: Date;
  dataExercicio: Date;
  regimeJuridico?: string;    // 'estatutario', 'celetista', 'comissionado', etc.
  cargoEfetivo?: string;
  cargoComissionado?: string;
  lotacao?: string;           // setor/lotação atual
  situacaoFuncional?: string; // 'ativo', 'afastado', 'licenca', 'aposentado', etc.
  atoNomeacao?: string;       // número do ato de nomeação
  dataNomeacao?: Date;
  dataAposentadoria?: Date;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const ServidorFuncionarioSchema = new Schema<IServidorFuncionario>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, unique: true },
    matriculaFuncional: { type: String, required: true, unique: true },
    dataPosse: { type: Date, required: true },
    dataExercicio: { type: Date, required: true },
    regimeJuridico: { type: String, trim: true },
    cargoEfetivo: { type: String, trim: true },
    cargoComissionado: { type: String, trim: true },
    lotacao: { type: String, trim: true },
    situacaoFuncional: { type: String, trim: true },
    atoNomeacao: { type: String, trim: true },
    dataNomeacao: { type: Date },
    dataAposentadoria: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'servidores_funcionarios'
  }
);

export default mongoose.model<IServidorFuncionario>('ServidorFuncionario', ServidorFuncionarioSchema);

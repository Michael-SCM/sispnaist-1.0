import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para dependentes do trabalhador.
 * Equivalente a: tb_trabalhador_dependentes no PHP original.
 */

export interface ITrabalhadorDependente extends Document {
  trabalhadorId: string;
  nome: string;
  cpf?: string;
  dataNascimento?: Date;
  parentesco: string;     // 'conjuge', 'filho', 'enteado', 'irmao', 'mae', 'pai', 'outro'
  dependentIR?: boolean;   // dependente para imposto de renda
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorDependenteSchema = new Schema<ITrabalhadorDependente>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    nome: { type: String, required: true, trim: true },
    cpf: { type: String, trim: true },
    dataNascimento: { type: Date },
    parentesco: { type: String, required: true },
    dependentIR: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_dependentes'
  }
);

TrabalhadorDependenteSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorDependente>('TrabalhadorDependente', TrabalhadorDependenteSchema);

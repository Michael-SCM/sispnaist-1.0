import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para templates/padrões de email.
 * Equivalente a: tb_padrao_email no PHP original.
 */

export interface IPadraoEmail extends Document {
  nome: string;
  assunto: string;
  conteudo: string;           // HTML do template
  categoria?: string;         // 'notificacao', 'convocacao', 'relatorio', etc.
  variaveis?: string[];       // variáveis disponíveis: {{nome}}, {{data}}, etc.
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const PadraoEmailSchema = new Schema<IPadraoEmail>(
  {
    nome: { type: String, required: true, trim: true },
    assunto: { type: String, required: true, trim: true },
    conteudo: { type: String, required: true },
    categoria: { type: String, trim: true },
    variaveis: [{ type: String }],
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'padroes_email'
  }
);

export default mongoose.model<IPadraoEmail>('PadraoEmail', PadraoEmailSchema);

import mongoose, { Document } from 'mongoose';
import { IVacinacao } from '../types/index.js';
export interface IVacinacaoDocument extends IVacinacao, Document {
}
declare const _default: mongoose.Model<IVacinacaoDocument, {}, {}, {}, mongoose.Document<unknown, {}, IVacinacaoDocument, {}, {}> & IVacinacaoDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Vacinacao.d.ts.map
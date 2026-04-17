import mongoose, { Document } from 'mongoose';
import { IUnidade } from '../types/index.js';
export interface IUnidadeDocument extends IUnidade, Document {
}
declare const _default: mongoose.Model<IUnidadeDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUnidadeDocument, {}, {}> & IUnidadeDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Unidade.d.ts.map
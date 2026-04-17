import mongoose, { Document } from 'mongoose';
import { IEmpresa } from '../types/index.js';
export interface IEmpresaDocument extends IEmpresa, Document {
}
declare const _default: mongoose.Model<IEmpresaDocument, {}, {}, {}, mongoose.Document<unknown, {}, IEmpresaDocument, {}, {}> & IEmpresaDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Empresa.d.ts.map
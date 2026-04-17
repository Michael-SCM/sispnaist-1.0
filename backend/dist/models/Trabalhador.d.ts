import mongoose, { Document } from 'mongoose';
import { ITrabalhador } from '../types/index.js';
export interface ITrabalhadorDocument extends ITrabalhador, Document {
}
declare const _default: mongoose.Model<ITrabalhadorDocument, {}, {}, {}, mongoose.Document<unknown, {}, ITrabalhadorDocument, {}, {}> & ITrabalhadorDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Trabalhador.d.ts.map
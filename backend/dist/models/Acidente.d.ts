import mongoose, { Document } from 'mongoose';
import { IAcidente } from '../types/index.js';
export interface IAcidenteDocument extends IAcidente, Document {
}
declare const _default: mongoose.Model<IAcidenteDocument, {}, {}, {}, mongoose.Document<unknown, {}, IAcidenteDocument, {}, {}> & IAcidenteDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Acidente.d.ts.map
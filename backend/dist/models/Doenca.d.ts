import mongoose, { Document } from 'mongoose';
import { IDoenca } from '../types/index.js';
export interface IDoencaDocument extends IDoenca, Document {
}
declare const _default: mongoose.Model<IDoencaDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDoencaDocument, {}, {}> & IDoencaDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Doenca.d.ts.map
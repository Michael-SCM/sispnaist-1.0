import mongoose, { Document } from 'mongoose';
import { IUser } from '../types/index.js';
export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map
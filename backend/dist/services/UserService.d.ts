import { IUser } from '../types/index.js';
export declare class UserService {
    listar(page?: number, limit?: number, filtros?: {
        nome?: string;
        email?: string;
        perfil?: string;
    }): Promise<{
        usuarios: IUser[];
        total: number;
        pages: number;
    }>;
    obter(id: string): Promise<IUser>;
    atualizar(id: string, userData: Partial<IUser>): Promise<IUser>;
    deletar(id: string): Promise<void>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=UserService.d.ts.map
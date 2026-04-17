import { IEmpresa } from '../types/index.js';
export declare class EmpresaService {
    listar(page?: number, limit?: number, filtros?: {
        razaoSocial?: string;
        cnpj?: string;
    }): Promise<{
        empresas: IEmpresa[];
        total: number;
        pages: number;
    }>;
    obter(id: string): Promise<IEmpresa>;
    criar(empresaData: Partial<IEmpresa>): Promise<IEmpresa>;
    atualizar(id: string, empresaData: Partial<IEmpresa>): Promise<IEmpresa>;
    deletar(id: string): Promise<void>;
}
declare const _default: EmpresaService;
export default _default;
//# sourceMappingURL=EmpresaService.d.ts.map
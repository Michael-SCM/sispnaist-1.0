import { IUnidade } from '../types/index.js';
export declare class UnidadeService {
    listar(page?: number, limit?: number, filtros?: {
        nome?: string;
        empresaId?: string;
    }): Promise<{
        unidades: IUnidade[];
        total: number;
        pages: number;
    }>;
    obter(id: string): Promise<IUnidade>;
    criar(unidadeData: Partial<IUnidade>): Promise<IUnidade>;
    atualizar(id: string, unidadeData: Partial<IUnidade>): Promise<IUnidade>;
    deletar(id: string): Promise<void>;
    listarPorEmpresa(empresaId: string): Promise<IUnidade[]>;
}
declare const _default: UnidadeService;
export default _default;
//# sourceMappingURL=UnidadeService.d.ts.map
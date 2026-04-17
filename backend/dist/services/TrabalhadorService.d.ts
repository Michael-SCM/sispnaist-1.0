import { ITrabalhador } from '../types/index.js';
export declare class TrabalhadorService {
    listar(page?: number, limit?: number, filtros?: {
        nome?: string;
        cpf?: string;
        matricula?: string;
        setor?: string;
    }): Promise<{
        trabalhadores: ITrabalhador[];
        total: number;
        pages: number;
    }>;
    obter(id: string): Promise<ITrabalhador>;
    obterPorCpf(cpf: string): Promise<ITrabalhador>;
    criar(trabalhadorData: Partial<ITrabalhador>): Promise<ITrabalhador>;
    atualizar(id: string, trabalhadorData: Partial<ITrabalhador>): Promise<ITrabalhador>;
    deletar(id: string): Promise<void>;
}
declare const _default: TrabalhadorService;
export default _default;
//# sourceMappingURL=TrabalhadorService.d.ts.map
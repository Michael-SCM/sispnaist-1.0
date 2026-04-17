import { IVacinacao } from '../types/index.js';
export declare class VacinacaoService {
    criar(data: Partial<IVacinacao>): Promise<IVacinacao>;
    obter(id: string): Promise<IVacinacao>;
    listar(filtros: {
        page?: number;
        limit?: number;
        vacina?: string;
        trabalhadorId?: string;
    }): Promise<{
        vacinacoes: IVacinacao[];
        total: number;
        pages: number;
    }>;
    atualizar(id: string, data: Partial<IVacinacao>): Promise<IVacinacao>;
    deletar(id: string): Promise<void>;
    obterPorTrabalhador(trabalhadorId: string): Promise<IVacinacao[]>;
    obterEstatisticas(): Promise<{
        total: number;
        porVacina: Record<string, number>;
        proximasDoses: number;
    }>;
    private resolverTrabalhadorId;
}
declare const _default: VacinacaoService;
export default _default;
//# sourceMappingURL=VacinacaoService.d.ts.map
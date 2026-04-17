import { IDoenca } from '../types/index.js';
export declare class DoencaService {
    /**
     * Resolve trabalhadorId de CPF para ObjectId
     */
    private resolverTrabalhadorId;
    criar(doencaData: Partial<IDoenca>): Promise<IDoenca>;
    obter(id: string): Promise<IDoenca>;
    listar(page?: number, limit?: number, filtros?: {
        nomeDoenca?: string;
        ativo?: boolean;
        trabalhadorId?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        doencas: IDoenca[];
        total: number;
        pages: number;
    }>;
    atualizar(id: string, doencaData: Partial<IDoenca>): Promise<IDoenca>;
    deletar(id: string): Promise<void>;
    obterPorTrabalhador(trabalhadorId: string, page?: number, limit?: number): Promise<{
        doencas: IDoenca[];
        total: number;
        pages: number;
    }>;
    obterEstatisticas(): Promise<{
        total: number;
        porNome: {
            [key: string]: number;
        };
        ativas: number;
        encerradas: number;
        ultimosMeses: {
            mes: string;
            quantidade: number;
        }[];
    }>;
}
declare const _default: DoencaService;
export default _default;
//# sourceMappingURL=DoencaService.d.ts.map
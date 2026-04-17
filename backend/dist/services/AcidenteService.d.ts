import { IAcidente } from '../types/index.js';
export declare class AcidenteService {
    /**
     * Resolve trabalhadorId de CPF para ObjectId
     * Se o valor já for um ObjectId válido, retorna como está
     * Se for um CPF, busca o usuário ou trabalhador e retorna seu ObjectId
     */
    private resolverTrabalhadorId;
    criar(acidenteData: Partial<IAcidente>): Promise<IAcidente>;
    obter(id: string): Promise<IAcidente>;
    listar(page?: number, limit?: number, filtros?: {
        tipoAcidente?: string;
        status?: string;
        trabalhadorId?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        acidentes: IAcidente[];
        total: number;
        pages: number;
    }>;
    atualizar(id: string, acidenteData: Partial<IAcidente>): Promise<IAcidente>;
    deletar(id: string): Promise<void>;
    obterPorTrabalhador(trabalhadorId: string, page?: number, limit?: number): Promise<{
        acidentes: IAcidente[];
        total: number;
        pages: number;
    }>;
    obterEstatisticas(): Promise<{
        total: number;
        porTipo: {
            [key: string]: number;
        };
        porStatus: {
            [key: string]: number;
        };
        ultimosMeses: {
            mes: string;
            quantidade: number;
        }[];
    }>;
}
declare const _default: AcidenteService;
export default _default;
//# sourceMappingURL=AcidenteService.d.ts.map
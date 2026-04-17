import { Request, Response } from 'express';
/**
 * @desc    Listar unidades com paginação e filtros
 * @route   GET /api/unidades
 * @access  Private/Admin
 */
export declare const getUnidades: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Obter uma única unidade
 * @route   GET /api/unidades/:id
 * @access  Private/Admin
 */
export declare const getUnidade: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Criar nova unidade
 * @route   POST /api/unidades
 * @access  Private/Admin
 */
export declare const createUnidade: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Atualizar unidade
 * @route   PUT /api/unidades/:id
 * @access  Private/Admin
 */
export declare const updateUnidade: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Deletar unidade
 * @route   DELETE /api/unidades/:id
 * @access  Private/Admin
 */
export declare const deleteUnidade: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Listar unidades por empresa
 * @route   GET /api/unidades/empresa/:empresaId
 * @access  Private
 */
export declare const getUnidadesPorEmpresa: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=unidadeController.d.ts.map
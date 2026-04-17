import { Request, Response } from 'express';
/**
 * @desc    Listar empresas com paginação e filtros
 * @route   GET /api/empresas
 * @access  Private/Admin
 */
export declare const getEmpresas: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Obter uma única empresa
 * @route   GET /api/empresas/:id
 * @access  Private/Admin
 */
export declare const getEmpresa: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Criar nova empresa
 * @route   POST /api/empresas
 * @access  Private/Admin
 */
export declare const createEmpresa: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Atualizar empresa
 * @route   PUT /api/empresas/:id
 * @access  Private/Admin
 */
export declare const updateEmpresa: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Deletar empresa
 * @route   DELETE /api/empresas/:id
 * @access  Private/Admin
 */
export declare const deleteEmpresa: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=empresaController.d.ts.map
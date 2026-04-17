import { Request, Response } from 'express';
/**
 * @desc    Listar trabalhadores com paginação e filtros
 * @route   GET /api/trabalhadores
 * @access  Private
 */
export declare const getTrabalhadores: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Obter um único trabalhador
 * @route   GET /api/trabalhadores/:id
 * @access  Private
 */
export declare const getTrabalhador: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Criar novo trabalhador
 * @route   POST /api/trabalhadores
 * @access  Private/Admin/Saude
 */
export declare const createTrabalhador: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
export declare const updateTrabalhador: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Deletar trabalhador
 * @route   DELETE /api/trabalhadores/:id
 * @access  Private/Admin
 */
export declare const deleteTrabalhador: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=trabalhadorController.d.ts.map
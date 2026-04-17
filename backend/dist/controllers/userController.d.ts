import { Request, Response } from 'express';
/**
 * @desc    Listar usuários com paginação e filtros
 * @route   GET /api/usuarios
 * @access  Private/Admin
 */
export declare const getUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Obter um único usuário
 * @route   GET /api/usuarios/:id
 * @access  Private/Admin
 */
export declare const getUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Atualizar usuário (perfil/status)
 * @route   PUT /api/usuarios/:id
 * @access  Private/Admin
 */
export declare const updateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Deletar usuário
 * @route   DELETE /api/usuarios/:id
 * @access  Private/Admin
 */
export declare const deleteUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=userController.d.ts.map
import { Request, Response, NextFunction } from 'express';
export interface IAuthRequest extends Request {
    user?: {
        id: string;
        cpf: string;
        email: string;
        perfil: string;
    };
}
export declare const authMiddleware: (req: IAuthRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: IAuthRequest, res: Response, next: NextFunction) => void;
export declare const adminMiddleware: (req: IAuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
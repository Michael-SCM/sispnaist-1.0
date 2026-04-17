interface TokenPayload {
    id: string;
    cpf: string;
    email: string;
    perfil: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload | null;
export declare const decodeToken: (token: string) => TokenPayload | null;
export {};
//# sourceMappingURL=jwt.d.ts.map
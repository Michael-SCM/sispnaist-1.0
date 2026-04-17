import { IUser } from '../types/index.js';
export declare class AuthService {
    register(userData: Partial<IUser> & {
        senha: string;
    }): Promise<{
        user: IUser;
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: IUser;
        token: string;
    }>;
    me(userId: string): Promise<IUser>;
    updateProfile(userId: string, userData: Partial<IUser>): Promise<IUser>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=AuthService.d.ts.map
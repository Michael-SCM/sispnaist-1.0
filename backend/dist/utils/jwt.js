import jwt from 'jsonwebtoken';
import config from '../config/config.js';
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpire,
    });
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    }
    catch {
        return null;
    }
};
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=jwt.js.map
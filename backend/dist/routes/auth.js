"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController = __importStar(require("../controllers/authController.js"));
const validation_js_1 = require("../middleware/validation.js");
const auth_js_1 = require("../middleware/auth.js");
const validations_js_1 = require("../utils/validations.js");
const router = express_1.default.Router();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { status: 'error', message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', authLimiter, (0, validation_js_1.validateRequest)(validations_js_1.registerSchema), authController.register);
router.post('/login', authLimiter, (0, validation_js_1.validateRequest)(validations_js_1.loginSchema), authController.login);
router.get('/me', auth_js_1.authMiddleware, authController.me);
router.put('/profile', auth_js_1.authMiddleware, (0, validation_js_1.validateRequest)(validations_js_1.updateProfileSchema), authController.updateProfile);
router.post('/forgot-password', authLimiter, (0, validation_js_1.validateRequest)(validations_js_1.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', (0, validation_js_1.validateRequest)(validations_js_1.resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authLimiter, (0, validation_js_1.validateRequest)(validations_js_1.verifyEmailSchema), authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', auth_js_1.authMiddleware, authController.logout);
exports.default = router;

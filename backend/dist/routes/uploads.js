"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadController_1 = __importDefault(require("../controllers/uploadController"));
const auth_1 = require("../middleware/auth");
const config_js_1 = __importDefault(require("../config/config.js"));
const router = (0, express_1.Router)();
const uploadDir = config_js_1.default.uploadDir || path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configuração do Multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: config_js_1.default.maxFileSize || 10485760 // 10MB default
    },
    fileFilter: function (req, file, cb) {
        // Aceita tipos comuns de arquivos
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido'));
        }
    }
});
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
router.get('/', uploadController_1.default.listar);
router.get('/:id', uploadController_1.default.obter);
router.post('/', upload.single('file'), uploadController_1.default.criar);
router.get('/:id/download', uploadController_1.default.download);
router.get('/:id/view', uploadController_1.default.visualizar);
router.delete('/:id', uploadController_1.default.deletar);
exports.default = router;

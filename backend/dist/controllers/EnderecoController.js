"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class EnderecoController {
    // Busca bairros pelo nome (Proxy para o webservice original)
    async buscarBairros(req, res, next) {
        try {
            const { pesquisa } = req.query;
            if (!pesquisa)
                throw new errorHandler_js_1.AppError('Termo de pesquisa é obrigatório', 400);
            // Usando a URL do sistema original
            const url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaBairro.php?valorPesquisa=${pesquisa}`;
            const response = await axios_1.default.get(url);
            return res.status(200).json(response.data);
        }
        catch (error) {
            next(error);
        }
    }
    // Busca logradouros por bairro
    async buscarLogradouros(req, res, next) {
        try {
            const { bairroId, nomeBairro, pesquisa } = req.query;
            let url = '';
            if (bairroId) {
                url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?id_fk_bairro=${bairroId}`;
            }
            else if (nomeBairro) {
                url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?bairro=${nomeBairro}`;
            }
            else if (pesquisa) {
                url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?valorPesquisa=${pesquisa}`;
            }
            else {
                throw new errorHandler_js_1.AppError('Parâmetros de busca insuficientes', 400);
            }
            const response = await axios_1.default.get(url);
            return res.status(200).json(response.data);
        }
        catch (error) {
            next(error);
        }
    }
    // Busca CEP (ViaCEP)
    async buscarCEP(req, res, next) {
        try {
            const { cep } = req.params;
            const response = await axios_1.default.get(`https://viacep.com.br/ws/${cep}/json/`);
            return res.status(200).json(response.data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new EnderecoController();

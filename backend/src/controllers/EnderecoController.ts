import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';

const INPUT_RE = /^[\w\s.,\-/À-ÿ]+$/;
const ID_RE = /^\d+$/;

function sanitizeQuery(val: unknown): string {
  if (typeof val !== 'string' || val.length > 100 || !INPUT_RE.test(val)) {
    throw new AppError('Parâmetro de busca inválido', 400);
  }
  return encodeURIComponent(val);
}

class EnderecoController {
  
  // Busca bairros pelo nome (Proxy para o webservice original)
  async buscarBairros(req: Request, res: Response, next: NextFunction) {
    try {
      const { pesquisa } = req.query;
      if (!pesquisa || typeof pesquisa !== 'string') {
        throw new AppError('Termo de pesquisa é obrigatório', 400);
      }

      const termo = sanitizeQuery(pesquisa);
      const url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaBairro.php?valorPesquisa=${termo}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      return res.status(200).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  // Busca logradouros por bairro
  async buscarLogradouros(req: Request, res: Response, next: NextFunction) {
    try {
      const { bairroId, nomeBairro, pesquisa } = req.query;
      
      let url = '';
      if (bairroId && typeof bairroId === 'string' && ID_RE.test(bairroId)) {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?id_fk_bairro=${encodeURIComponent(bairroId)}`;
      } else if (nomeBairro && typeof nomeBairro === 'string') {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?bairro=${sanitizeQuery(nomeBairro)}`;
      } else if (pesquisa && typeof pesquisa === 'string') {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?valorPesquisa=${sanitizeQuery(pesquisa)}`;
      } else {
        throw new AppError('Parâmetros de busca insuficientes', 400);
      }

      const response = await axios.get(url, { timeout: 5000 });
      return res.status(200).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  // Busca CEP (ViaCEP) — apenas formato 8 dígitos ou XXXXX-XXX
  async buscarCEP(req: Request, res: Response, next: NextFunction) {
    try {
      const { cep } = req.params;
      const cepLimpo = cep.replace(/\D/g, '');
      if (!/^\d{8}$/.test(cepLimpo)) {
        throw new AppError('CEP deve conter 8 dígitos numéricos', 400);
      }
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, { timeout: 5000 });
      return res.status(200).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default new EnderecoController();

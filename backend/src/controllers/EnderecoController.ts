import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';

class EnderecoController {
  
  // Busca bairros pelo nome (Proxy para o webservice original)
  async buscarBairros(req: Request, res: Response, next: NextFunction) {
    try {
      const { pesquisa } = req.query;
      if (!pesquisa) throw new AppError('Termo de pesquisa é obrigatório', 400);

      // Usando a URL do sistema original
      const url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaBairro.php?valorPesquisa=${pesquisa}`;
      
      const response = await axios.get(url);
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
      if (bairroId) {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?id_fk_bairro=${bairroId}`;
      } else if (nomeBairro) {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?bairro=${nomeBairro}`;
      } else if (pesquisa) {
        url = `http://www.paineldolegislador.com.br/ozielaraujo/sisleg/ws/geral/consultaLogradouro.php?valorPesquisa=${pesquisa}`;
      } else {
        throw new AppError('Parâmetros de busca insuficientes', 400);
      }

      const response = await axios.get(url);
      return res.status(200).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  // Busca CEP (ViaCEP)
  async buscarCEP(req: Request, res: Response, next: NextFunction) {
    try {
      const { cep } = req.params;
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      return res.status(200).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default new EnderecoController();

import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface Municipio {
  n: string;
  u: string;
}

let municipiosCache: Municipio[] | null = null;

function carregarMunicipios(): Municipio[] {
  if (municipiosCache) return municipiosCache;
  const filePath = path.resolve(__dirname, '..', 'data', 'municipios-brasil.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  municipiosCache = JSON.parse(raw);
  return municipiosCache!;
}

class MunicipioController {
  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const termo = String(q || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

      const municipios = carregarMunicipios();

      if (!termo) {
        return res.status(200).json(municipios.slice(0, 50));
      }

      const resultados = municipios.filter((m) => {
        const nomeNormalizado = m.n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return nomeNormalizado.startsWith(termo) || nomeNormalizado.includes(' ' + termo);
      }).slice(0, 20);

      return res.status(200).json(resultados);
    } catch (error) {
      next(error);
    }
  }

  async listarTodos(_req: Request, res: Response, next: NextFunction) {
    try {
      const municipios = carregarMunicipios();
      return res.status(200).json(municipios);
    } catch (error) {
      next(error);
    }
  }
}

export default new MunicipioController();

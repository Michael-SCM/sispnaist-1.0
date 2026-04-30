import { Request, Response, NextFunction } from 'express';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';
import { Parser } from 'json2csv';

class ExportController {
  
  async exportarAcidentesCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const acidentes = await Acidente.find()
        .populate('trabalhadorId', 'nome cpf')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Trabalhador', value: 'trabalhadorId.nome' },
        { label: 'CPF', value: 'trabalhadorId.cpf' },
        { label: 'Data', value: 'dataAcidente' },
        { label: 'Tipo', value: 'tipoAcidente' },
        { label: 'Status', value: 'status' }
      ];

      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(acidentes);

      res.header('Content-Type', 'text/csv');
      res.attachment('acidentes_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportarTrabalhadoresCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const trabalhadores = await Trabalhador.find().lean();
      
      const fields = ['nome', 'cpf', 'email', 'dataNascimento', 'sexo', 'empresa', 'unidade'];
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(trabalhadores);

      res.header('Content-Type', 'text/csv');
      res.attachment('trabalhadores_sispnaist.csv');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();

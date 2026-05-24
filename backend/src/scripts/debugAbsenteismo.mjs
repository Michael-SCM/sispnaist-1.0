import mongoose from 'mongoose';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.ts';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispnaist';

const toISO = (d) => (d instanceof Date ? d.toISOString() : d);

const main = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4 });

  const count = await TrabalhadorAfastamento.countDocuments({ ativo: true });
  const sample = await TrabalhadorAfastamento.find({ ativo: true }).limit(5).lean();

  // Diagnóstico rápido: totais e se existe algum registro sem ativo
  const countAll = await TrabalhadorAfastamento.countDocuments({});
  const countAtivoFalse = await TrabalhadorAfastamento.countDocuments({ ativo: false });
  const countAtivoUndefined = await TrabalhadorAfastamento.countDocuments({ ativo: { $exists: false } });
  const sampleAny = await TrabalhadorAfastamento.find({}).limit(3).lean();

  // Pipeline igual ao AnalyticsService (para confirmar se é pipeline/valores)
  const absAgg = await TrabalhadorAfastamento.aggregate([
    { $match: { ativo: true } },
    {
      $addFields: {
        dataFimCalc: { $ifNull: ['$dataFim', '$dataRetorno'] },
        dias: {
          $max: [
            0,
            {
              $ceil: {
                $divide: [
                  { $subtract: ['$dataFimCalc', '$dataInicio'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          ],
        },
      },
    },
    { $match: { dias: { $gt: 0 } } },
    {
      $group: {
        _id: { $month: '$dataInicio' },
        dias: { $sum: '$dias' },
        n: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Diagnóstico: quantos têm dias calculado >0 e quantos <=0
  const diag = await TrabalhadorAfastamento.aggregate([
    { $match: { ativo: true } },
    {
      $addFields: {
        dataFimCalc: { $ifNull: ['$dataFim', '$dataRetorno'] },
        dias: {
          $max: [
            0,
            {
              $ceil: {
                $divide: [
                  { $subtract: ['$dataFimCalc', '$dataInicio'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: { $cond: [{ $gt: ['$dias', 0] }, 'gt0', 'le0'] },
        n: { $sum: 1 },
        sumDias: { $sum: '$dias' },
        minDias: { $min: '$dias' },
        maxDias: { $max: '$dias' },
      },
    },
  ]);

  console.log(
    JSON.stringify(
      {
        countAtivoTrue: count,
        sampleAtivoTrue: sample.map((d) => ({
          _id: d._id,
          dataInicio: toISO(d.dataInicio),
          dataFim: toISO(d.dataFim),
          dataRetorno: toISO(d.dataRetorno),
          dataPericia: toISO(d.dataPericia),
          tempoAfastamento: d.tempoAfastamento,
          desfecho: d.desfecho,
          ativo: d.ativo,
        })),
        totals: {
          countAll,
          countAtivoFalse,
          countAtivoUndefined,
        },
        sampleAny,
        absenteismoPipeline: absAgg,
        diag,
      },
      null,
      2,
    ),
  );

  await mongoose.connection.close();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


export function filtrarUltimos30Dias<T>(itens: T[], campoData: keyof T): T[] {
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  return itens.filter((item) => {
    const valor = item[campoData];
    if (!valor) return false;
    const data = new Date(valor as string);
    return data >= trintaDiasAtras;
  });
}

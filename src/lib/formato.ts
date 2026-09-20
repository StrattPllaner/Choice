const pesos = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export const enPesos = (monto: number) => pesos.format(monto);

export const rangoPesos = ([min, max]: [number, number]) => `${enPesos(min)} a ${enPesos(max)} al mes`;

export const unirConY = (partes: string[]) =>
  new Intl.ListFormat('es-MX', { style: 'long', type: 'conjunction' }).format(partes);

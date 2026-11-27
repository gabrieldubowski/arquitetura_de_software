export class TimeoutError extends Error {
  constructor(ms) { super(`Dependência excedeu o limite de ${ms} ms`); this.name = 'TimeoutError'; }
}
// Limita a espera. Não cancela a operação subjacente: clients reais devem suportar AbortSignal.
export async function withTimeout(operation, ms = 1500) {
  if (!Number.isFinite(ms) || ms <= 0) throw new RangeError('Timeout deve ser positivo');
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new TimeoutError(ms)), ms); })
    ]);
  } finally { clearTimeout(timer); }
}

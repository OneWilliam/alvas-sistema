import { ErrorDeValidacion } from "../../../shared/domain";

/**
 * Representa un porcentaje de conversión (0–100) derivado de conteos de negocio.
 */
export class PorcentajeConversion {
  private constructor(public readonly valorNumerico: number) {
    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      throw new ErrorDeValidacion("PorcentajeConversion: valor invalido.");
    }
  }

  static desdeLeadsYClientes(totalClientes: number, totalLeads: number): PorcentajeConversion {
    const divisor = totalLeads <= 0 ? 1 : totalLeads;
    const bruto = (totalClientes / divisor) * 100;
    const redondeado = Math.round(bruto * 100) / 100;
    return new PorcentajeConversion(redondeado);
  }
}

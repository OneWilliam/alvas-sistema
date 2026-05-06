import { ErrorDeValidacion } from "../../../shared/domain";

export const TIPOS_LEAD = ["COMPRADOR", "VENDEDOR"] as const;
export type ValorTipoLead = (typeof TIPOS_LEAD)[number];

export class TipoLead {
  private readonly valorInterno: ValorTipoLead;

  constructor(valor: string) {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!TIPOS_LEAD.includes(valorNormalizado as ValorTipoLead)) {
      throw new ErrorDeValidacion(`Tipo de lead inválido: ${valor}`);
    }
    this.valorInterno = valorNormalizado as ValorTipoLead;
  }

  get valor(): ValorTipoLead {
    return this.valorInterno;
  }

  esComprador(): boolean {
    return this.valorInterno === "COMPRADOR";
  }

  esVendedor(): boolean {
    return this.valorInterno === "VENDEDOR";
  }
}

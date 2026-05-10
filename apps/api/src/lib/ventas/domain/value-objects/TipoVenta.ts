import { ErrorDeValidacion } from "../../../shared/domain";

export const TIPOS_VENTA = ["COMPRA", "VENTA"] as const;
export type ValorTipoVenta = (typeof TIPOS_VENTA)[number];

export class TipoVenta {
  private readonly valorInterno: ValorTipoVenta;

  constructor(valor: string) {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!TIPOS_VENTA.includes(valorNormalizado as ValorTipoVenta)) {
      throw new ErrorDeValidacion(`Tipo de venta inválido: ${valor}`);
    }
    this.valorInterno = valorNormalizado as ValorTipoVenta;
  }

  get valor(): ValorTipoVenta {
    return this.valorInterno;
  }

  esCompra(): boolean {
    return this.valorInterno === "COMPRA";
  }

  esVenta(): boolean {
    return this.valorInterno === "VENTA";
  }
}

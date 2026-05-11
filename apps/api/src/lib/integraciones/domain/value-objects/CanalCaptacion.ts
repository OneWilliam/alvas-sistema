import { ErrorDeValidacion } from "../../../shared/domain";

const CANALES_CAPTACION = ["WHATSAPP", "FORMULARIO_WEB", "META_ADS", "PORTAL", "REFERIDO"] as const;

export type ValorCanalCaptacion = (typeof CANALES_CAPTACION)[number];

export class CanalCaptacion {
  private readonly valorInterno: ValorCanalCaptacion;

  constructor(valor: string) {
    const normalizado = valor.trim().toUpperCase();

    if (!CANALES_CAPTACION.includes(normalizado as ValorCanalCaptacion)) {
      throw new ErrorDeValidacion("Canal de captacion no soportado.");
    }

    this.valorInterno = normalizado as ValorCanalCaptacion;
  }

  get valor(): ValorCanalCaptacion {
    return this.valorInterno;
  }
}

import { ErrorDeDominio } from "../../../shared/domain";

export class PropiedadError extends ErrorDeDominio {
  constructor(message: string, codigo: string) {
    super(message, { codigo, detalle: { contexto: "PROPIEDADES" } });
  }
}

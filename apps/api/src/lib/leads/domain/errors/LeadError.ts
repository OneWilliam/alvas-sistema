import { ErrorDeDominio } from "../../../shared/domain";

export class LeadError extends ErrorDeDominio {
  constructor(message: string, codigo: string) {
    super(message, { codigo, detalle: { contexto: "LEADS" } });
  }
}

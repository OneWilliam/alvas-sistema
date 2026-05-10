import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_LEAD = [
  "NUEVO",
  "CONTACTO",
  "AGENDADO",
  "TRABAJANDO",
  "CONVERTIDO",
  "PERDIDO",
] as const;

export type ValorEstadoLead = (typeof ESTADOS_LEAD)[number];

export class EstadoLead {
  private readonly valorInterno: ValorEstadoLead;

  constructor(valor: string) {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!ESTADOS_LEAD.includes(valorNormalizado as ValorEstadoLead)) {
      throw new ErrorDeValidacion(`Estado de lead inválido: ${valor}`);
    }
    this.valorInterno = valorNormalizado as ValorEstadoLead;
  }

  get valor(): ValorEstadoLead {
    return this.valorInterno;
  }

  static nuevo = () => new EstadoLead("NUEVO");
  static contacto = () => new EstadoLead("CONTACTO");
  static agendado = () => new EstadoLead("AGENDADO");
  static trabajando = () => new EstadoLead("TRABAJANDO");
  static convertido = () => new EstadoLead("CONVERTIDO");
  static perdido = () => new EstadoLead("PERDIDO");

  estaCerrado(): boolean {
    return this.valorInterno === "CONVERTIDO" || this.valorInterno === "PERDIDO";
  }
}

import { ErrorDeValidacion } from "../../../shared/domain";
import { type IdCita, type IdLead } from "../value-objects/Ids";

export const ESTADOS_CITA = ["PENDIENTE", "REALIZADA", "CANCELADA", "REPROGRAMADA"] as const;
export type ValorEstadoCita = (typeof ESTADOS_CITA)[number];

export type PropsCita = {
  id: IdCita;
  idLead: IdLead;
  idPropiedad?: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: ValorEstadoCita;
  observacion?: string;
};

export class Cita {
  private constructor(private props: PropsCita) {
    this.validarFechas();
  }

  static crear(params: Omit<PropsCita, "id"> & { id: IdCita }): Cita {
    return new Cita(params);
  }

  static reconstituir(props: PropsCita): Cita {
    return new Cita(props);
  }

  get id(): IdCita { return this.props.id; }
  get idLead(): IdLead { return this.props.idLead; }
  get idPropiedad(): string | undefined { return this.props.idPropiedad; }
  get fechaInicio(): Date { return this.props.fechaInicio; }
  get fechaFin(): Date { return this.props.fechaFin; }
  get estado(): ValorEstadoCita { return this.props.estado; }
  get observacion(): string | undefined { return this.props.observacion; }

  marcarComoRealizada(): void {
    if (this.props.estado === "CANCELADA") {
      throw new ErrorDeValidacion("No se puede marcar como realizada una cita cancelada.");
    }
    this.props.estado = "REALIZADA";
  }

  cancelar(motivo?: string): void {
    this.props.estado = "CANCELADA";
    if (motivo) {
      this.props.observacion = this.props.observacion 
        ? `${this.props.observacion} | Cancelado: ${motivo}`
        : `Cancelado: ${motivo}`;
    }
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}

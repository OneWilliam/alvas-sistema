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

  get id(): IdCita {
    return this.props.id;
  }
  get idLead(): IdLead {
    return this.props.idLead;
  }
  get idPropiedad(): string | undefined {
    return this.props.idPropiedad;
  }
  get fechaInicio(): Date {
    return this.props.fechaInicio;
  }
  get fechaFin(): Date {
    return this.props.fechaFin;
  }
  get estado(): ValorEstadoCita {
    return this.props.estado;
  }
  get observacion(): string | undefined {
    return this.props.observacion;
  }

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

  reprogramar(fechaInicio: Date, duracionMinutos: number, observacion?: string): void {
    if (this.props.estado === "REALIZADA") {
      throw new ErrorDeValidacion("No se puede reprogramar una cita ya realizada.");
    }

    if (duracionMinutos <= 0) {
      throw new ErrorDeValidacion("La duracion de la cita debe ser mayor que cero.");
    }

    this.props.fechaInicio = fechaInicio;
    this.props.fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
    this.props.estado = "REPROGRAMADA";

    if (observacion !== undefined) {
      this.props.observacion = observacion.trim() || undefined;
    }

    this.validarFechas();
  }

  actualizarObservacion(observacion?: string): void {
    this.props.observacion = observacion?.trim() || undefined;
  }

  actualizarPropiedad(idPropiedad?: string): void {
    this.props.idPropiedad = idPropiedad?.trim() || undefined;
  }

  cambiarEstado(estado: string, observacion?: string): void {
    const estadoNormalizado = estado.trim().toUpperCase() as ValorEstadoCita;

    if (!ESTADOS_CITA.includes(estadoNormalizado)) {
      throw new ErrorDeValidacion("Estado de cita invalido.");
    }

    switch (estadoNormalizado) {
      case "REALIZADA":
        this.marcarComoRealizada();
        break;
      case "CANCELADA":
        this.cancelar(observacion);
        return;
      case "REPROGRAMADA":
        this.props.estado = "REPROGRAMADA";
        break;
      case "PENDIENTE":
        this.props.estado = "PENDIENTE";
        break;
    }

    if (observacion !== undefined) {
      this.actualizarObservacion(observacion);
    }
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}

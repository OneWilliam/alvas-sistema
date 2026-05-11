import { type IdContrato, type IdCliente, type IdPropiedad } from "../value-objects/Ids";
import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_CONTRATO = ["BORRADOR", "VIGENTE", "FINALIZADO", "CANCELADO"] as const;
export type ValorEstadoContrato = (typeof ESTADOS_CONTRATO)[number];

export type PropsContrato = {
  id: IdContrato;
  idCliente: IdCliente;
  idPropiedad: IdPropiedad;
  fechaInicio: Date;
  fechaFin: Date;
  estado: ValorEstadoContrato;
  creadoEn: Date;
  actualizadoEn: Date;
};

export class Contrato {
  private constructor(private props: PropsContrato) {
    this.validarFechas();
  }

  static crear(params: {
    id: IdContrato;
    idCliente: IdCliente;
    idPropiedad: IdPropiedad;
    fechaInicio: Date;
    fechaFin: Date;
  }): Contrato {
    const ahora = new Date();
    return new Contrato({
      id: params.id,
      idCliente: params.idCliente,
      idPropiedad: params.idPropiedad,
      fechaInicio: params.fechaInicio,
      fechaFin: params.fechaFin,
      estado: "BORRADOR",
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsContrato): Contrato {
    return new Contrato(props);
  }

  get id(): IdContrato {
    return this.props.id;
  }
  get idCliente(): IdCliente {
    return this.props.idCliente;
  }
  get idPropiedad(): IdPropiedad {
    return this.props.idPropiedad;
  }
  get fechaInicio(): Date {
    return this.props.fechaInicio;
  }
  get fechaFin(): Date {
    return this.props.fechaFin;
  }
  get estado(): ValorEstadoContrato {
    return this.props.estado;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  firmar(): void {
    if (this.props.estado !== "BORRADOR") {
      throw new ErrorDeValidacion("Solo se pueden firmar contratos en estado borrador.");
    }
    this.props.estado = "VIGENTE";
    this.props.actualizadoEn = new Date();
  }

  finalizar(): void {
    this.props.estado = "FINALIZADO";
    this.props.actualizadoEn = new Date();
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}

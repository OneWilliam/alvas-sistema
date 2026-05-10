import { ErrorDeValidacion } from "../../../shared/domain";
import { type IdLead, type IdCliente } from "../value-objects/Ids";
import { EstadoLead } from "../value-objects/EstadoLead";
import { TipoVenta } from "../value-objects/TipoVenta";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { Cita } from "./Cita";

export type PropsLead = {
  id: IdLead;
  nombre: string;
  email: string;
  telefono: string;
  tipo: TipoVenta;
  estado: EstadoLead;
  idAsesor: IdUsuarioRef;
  idCliente?: IdCliente;
  idPropiedadInteres?: string;
  citas: Cita[];
  creadoEn: Date;
  actualizadoEn: Date;
};

export class Lead {
  private constructor(private props: PropsLead) {}

  static registrar(params: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    tipo: string;
    idAsesor: IdUsuarioRef;
    idPropiedadInteres?: string;
    idCliente?: IdCliente;
  }): Lead {
    const ahora = new Date();
    return new Lead({
      id: params.id as IdLead,
      nombre: params.nombre,
      email: params.email,
      telefono: params.telefono,
      tipo: new TipoVenta(params.tipo),
      estado: EstadoLead.nuevo(),
      idAsesor: params.idAsesor,
      idPropiedadInteres: params.idPropiedadInteres,
      idCliente: params.idCliente,
      citas: [],
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsLead): Lead {
    return new Lead(props);
  }

  get id(): IdLead { return this.props.id; }
  get nombre(): string { return this.props.nombre; }
  get email(): string { return this.props.email; }
  get telefono(): string { return this.props.telefono; }
  get tipo(): TipoVenta { return this.props.tipo; }
  get estado(): EstadoLead { return this.props.estado; }
  get idAsesor(): IdUsuarioRef { return this.props.idAsesor; }
  get idCliente(): IdCliente | undefined { return this.props.idCliente; }
  get idPropiedadInteres(): string | undefined { return this.props.idPropiedadInteres; }
  get citas(): ReadonlyArray<Cita> { return this.props.citas; }
  get creadoEn(): Date { return this.props.creadoEn; }
  get actualizadoEn(): Date { return this.props.actualizadoEn; }

  agendarCita(cita: Cita): void {
    if (this.estado.estaCerrado()) {
      throw new ErrorDeValidacion("No se pueden agendar citas en un lead cerrado.");
    }
    this.props.citas.push(cita);
    this.props.estado = EstadoLead.agendado();
    this.props.actualizadoEn = new Date();
  }

  cambiarEstado(nuevoEstado: EstadoLead): void {
    this.props.estado = nuevoEstado;
    this.props.actualizadoEn = new Date();
  }

  convertirACliente(idCliente: IdCliente): void {
    if (this.props.estado.valor === "CONVERTIDO") {
      throw new ErrorDeValidacion("El lead ya ha sido convertido a cliente.");
    }
    this.props.estado = EstadoLead.convertido();
    this.props.idCliente = idCliente;
    this.props.actualizadoEn = new Date();
  }
}

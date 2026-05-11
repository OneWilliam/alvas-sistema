import { type Cita } from "../../domain/entities/Cita";
import { ErrorDeValidacion } from "../../../shared/domain";
import { type IdLead, type IdCita } from "../value-objects/Ids";
import { EstadoLead } from "../value-objects/EstadoLead";
import { TipoVenta } from "../value-objects/TipoVenta";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type IdCliente } from "../value-objects/Ids";
import { type IdPropiedad } from "../value-objects/IdPropiedad";

export type PropsLead = {
  id: IdLead;
  nombre: string;
  email: string;
  telefono: string;
  tipo: TipoVenta;
  estado: EstadoLead;
  idAsesor: IdUsuarioRef;
  idCliente?: IdCliente;
  idPropiedadInteres?: IdPropiedad;
  citas: ReadonlyArray<Cita>;
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
    idAsesor: string;
    idPropiedadInteres?: string;
    idCliente?: string;
  }): Lead {
    const ahora = new Date();
    return new Lead({
      id: params.id as IdLead,
      nombre: params.nombre,
      email: params.email,
      telefono: params.telefono,
      tipo: new TipoVenta(params.tipo),
      estado: EstadoLead.nuevo(),
      idAsesor: params.idAsesor as IdUsuarioRef,
      idPropiedadInteres: params.idPropiedadInteres as IdPropiedad | undefined,
      idCliente: params.idCliente as IdCliente | undefined,
      citas: [],
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsLead): Lead {
    return new Lead(props);
  }

  get id(): IdLead {
    return this.props.id;
  }
  get nombre(): string {
    return this.props.nombre;
  }
  get email(): string {
    return this.props.email;
  }
  get telefono(): string {
    return this.props.telefono;
  }
  get tipo(): TipoVenta {
    return this.props.tipo;
  }
  get estado(): EstadoLead {
    return this.props.estado;
  }
  get idAsesor(): IdUsuarioRef {
    return this.props.idAsesor;
  }
  get idCliente(): IdCliente | undefined {
    return this.props.idCliente;
  }
  get idPropiedadInteres(): IdPropiedad | undefined {
    return this.props.idPropiedadInteres;
  }
  get citas(): ReadonlyArray<Cita> {
    return this.props.citas;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  agendarCita(cita: Cita): void {
    if (this.props.estado.estaCerrado()) {
      throw new ErrorDeValidacion("No se pueden agendar citas en un lead cerrado.");
    }
    this.props.citas = [...this.props.citas, cita];
    this.props.actualizadoEn = new Date();
  }

  cambiarEstado(nuevoEstado: string): void {
    this.props.estado = new EstadoLead(nuevoEstado);
    this.props.actualizadoEn = new Date();
  }

  convertirACliente(idCliente: IdCliente): void {
    if (this.props.estado === EstadoLead.convertido()) {
      throw new ErrorDeValidacion("El lead ya ha sido convertido a cliente.");
    }
    this.props.estado = EstadoLead.convertido();
    this.props.idCliente = idCliente;
    this.props.actualizadoEn = new Date();
  }

  obtenerCitaPorId(idCita: IdCita): Cita | undefined {
    return this.props.citas.find((cita) => cita.id === idCita);
  }

  obtenerVisitasRealizadas(): Cita[] {
    return [...this.props.citas]
      .filter((cita) => cita.estado === "REALIZADA")
      .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime());
  }

  esPrimeraVisita(idCita: IdCita): boolean {
    const visitas = this.obtenerVisitasRealizadas();
    const primeraVisita = visitas[0];
    return !!primeraVisita && primeraVisita.id === idCita;
  }

  esSegundaVisita(idCita: IdCita): boolean {
    const visitas = this.obtenerVisitasRealizadas();
    const segundaVisita = visitas[1];
    return !!segundaVisita && segundaVisita.id === idCita;
  }

  obtenerResumenVisitas(): { tienePrimeraVisita: boolean; tieneSegundaVisita: boolean } {
    const visitas = this.obtenerVisitasRealizadas();
    return {
      tienePrimeraVisita: visitas.length > 0,
      tieneSegundaVisita: visitas.length > 1,
    };
  }

  actualizarDatosPropiedad(idPropiedad: string): void {
    this.props.idPropiedadInteres = idPropiedad as IdPropiedad;
    this.props.actualizadoEn = new Date();
  }

  cambiarAsesor(idAsesorNuevo: IdUsuarioRef): void {
    this.props.idAsesor = idAsesorNuevo;
    this.props.actualizadoEn = new Date();
  }
}

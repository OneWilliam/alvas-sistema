import { type IdCliente, type IdLead } from "../value-objects/Ids";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";

export type PropsCliente = {
  id: IdCliente;
  nombre: string;
  email: string;
  telefono: string;
  idAsesor: IdUsuarioRef;
  idLeadOrigen?: IdLead;
  creadoEn: Date;
  actualizadoEn: Date;
};

export class Cliente {
  private constructor(private props: PropsCliente) {}

  static crear(params: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    idAsesor: IdUsuarioRef;
    idLeadOrigen?: IdLead;
  }): Cliente {
    const ahora = new Date();
    return new Cliente({
      ...params,
      id: params.id as IdCliente,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsCliente): Cliente {
    return new Cliente(props);
  }

  get id(): IdCliente { return this.props.id; }
  get nombre(): string { return this.props.nombre; }
  get email(): string { return this.props.email; }
  get telefono(): string { return this.props.telefono; }
  get idAsesor(): IdUsuarioRef { return this.props.idAsesor; }
  get idLeadOrigen(): IdLead | undefined { return this.props.idLeadOrigen; }
  get creadoEn(): Date { return this.props.creadoEn; }
  get actualizadoEn(): Date { return this.props.actualizadoEn; }
}

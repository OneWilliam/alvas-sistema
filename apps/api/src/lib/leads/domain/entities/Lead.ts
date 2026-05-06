import { idLead, type IdLead } from "../value-objects";
import { type IdUsuarioRef } from "../value-objects";
import { TipoLead } from "../value-objects/TipoLead";

type PropsLead = {
  id: IdLead;
  nombre: string;
  email: string;
  telefono: string;
  tipo: TipoLead;
  idAsesor: IdUsuarioRef;
  creadoEn: Date;
  actualizadoEn: Date;
};

export class Lead {
  private props: PropsLead;

  private constructor(props: PropsLead) {
    this.props = props;
  }

  static crear(params: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    tipo: string;
    idAsesor: IdUsuarioRef;
  }): Lead {
    const ahora = new Date();
    return new Lead({
      id: idLead(params.id),
      nombre: params.nombre,
      email: params.email,
      telefono: params.telefono,
      tipo: new TipoLead(params.tipo),
      idAsesor: params.idAsesor,
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
  get tipo(): TipoLead { return this.props.tipo; }
  get idAsesor(): IdUsuarioRef { return this.props.idAsesor; }
  get creadoEn(): Date { return this.props.creadoEn; }
  get actualizadoEn(): Date { return this.props.actualizadoEn; }
}

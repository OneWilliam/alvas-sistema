import { type IdLead } from "../value-objects/IdLead";
import { type IdUsuarioRef } from "../value-objects/IdUsuarioRef";
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

  constructor(props: PropsLead) {
    this.props = props;
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

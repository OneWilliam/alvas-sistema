import { type IdPropiedad } from "../value-objects/IdPropiedad";
import { type IdUsuarioRef } from "../value-objects";

type PropsPropiedad = {
  id: IdPropiedad;
  titulo: string;
  descripcion: string;
  precio: number;
  idAsesor: IdUsuarioRef;
  creadoEn: Date;
  actualizadoEn: Date;
};

export class Propiedad {
  private props: PropsPropiedad;

  constructor(props: PropsPropiedad) {
    this.props = props;
  }

  get id(): IdPropiedad { return this.props.id; }
  get titulo(): string { return this.props.titulo; }
  get descripcion(): string { return this.props.descripcion; }
  get precio(): number { return this.props.precio; }
  get idAsesor(): IdUsuarioRef { return this.props.idAsesor; }
}

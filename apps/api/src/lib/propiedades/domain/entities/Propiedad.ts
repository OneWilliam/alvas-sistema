import { idPropiedad, type IdPropiedad, type IdUsuarioRef } from "../value-objects";

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

  private constructor(props: PropsPropiedad) {
    this.props = props;
  }

  static crear(params: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    idAsesor: IdUsuarioRef;
  }): Propiedad {
    const ahora = new Date();
    return new Propiedad({
      id: idPropiedad(params.id),
      titulo: params.titulo,
      descripcion: params.descripcion,
      precio: params.precio,
      idAsesor: params.idAsesor,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsPropiedad): Propiedad {
    return new Propiedad(props);
  }

  get id(): IdPropiedad {
    return this.props.id;
  }
  get titulo(): string {
    return this.props.titulo;
  }
  get descripcion(): string {
    return this.props.descripcion;
  }
  get precio(): number {
    return this.props.precio;
  }
  get idAsesor(): IdUsuarioRef {
    return this.props.idAsesor;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }
}

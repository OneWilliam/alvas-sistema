import {
  CanalCaptacion,
  DatosContactoCaptacion,
  OrigenCaptacion,
} from "../value-objects";

type CaptacionProps = Readonly<{
  canal: CanalCaptacion;
  origen: OrigenCaptacion;
  contacto: DatosContactoCaptacion;
  tipo: string;
  idPropiedadInteres?: string;
  metadata?: Readonly<Record<string, string>>;
}>;

export class Captacion {
  private constructor(private readonly props: CaptacionProps) {}

  static registrar(params: {
    canal: string;
    origen: string;
    nombre: string;
    telefono: string;
    email?: string;
    tipo: string;
    idPropiedadInteres?: string;
    metadata?: Readonly<Record<string, string>>;
  }): Captacion {
    return new Captacion({
      canal: new CanalCaptacion(params.canal),
      origen: new OrigenCaptacion(params.origen),
      contacto: DatosContactoCaptacion.crear({
        nombre: params.nombre,
        telefono: params.telefono,
        email: params.email,
      }),
      tipo: params.tipo.trim().toUpperCase(),
      idPropiedadInteres: params.idPropiedadInteres?.trim() || undefined,
      metadata: params.metadata,
    });
  }

  get canal(): CanalCaptacion {
    return this.props.canal;
  }

  get origen(): OrigenCaptacion {
    return this.props.origen;
  }

  get contacto(): DatosContactoCaptacion {
    return this.props.contacto;
  }

  get tipo(): string {
    return this.props.tipo;
  }

  get idPropiedadInteres(): string | undefined {
    return this.props.idPropiedadInteres;
  }

  get metadata(): Readonly<Record<string, string>> | undefined {
    return this.props.metadata;
  }

  get emailDeContacto(): string {
    return (
      this.props.contacto.email ??
      `${this.props.contacto.telefono}@contacto.${this.props.canal.valor.toLowerCase()}.local`
    );
  }
}

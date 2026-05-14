import { idPropiedad, type IdPropiedad, type IdUsuarioRef } from "../value-objects";
import { PropiedadError } from "../errors/PropiedadError";

export const ORIGENES_PROPIEDAD = ["ALVAS", "CLIENTE", "CAPTACION"] as const;
export type OrigenPropiedad = (typeof ORIGENES_PROPIEDAD)[number];

export const ESTADOS_PROPIEDAD = [
  "PRELIMINAR",
  "EN_VALIDACION",
  "DISPONIBLE",
  "RESERVADA",
  "VENDIDA",
  "DESCARTADA",
] as const;
export type EstadoPropiedad = (typeof ESTADOS_PROPIEDAD)[number];

type PropsPropiedad = {
  id: IdPropiedad;
  titulo: string;
  descripcion: string;
  precio: number;
  origen: OrigenPropiedad;
  estado: EstadoPropiedad;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: IdUsuarioRef;
  asesorResponsableId?: IdUsuarioRef;
  creadoEn: Date;
  actualizadoEn: Date;
};

type DatosPropiedad = {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  estado?: string;
  idClientePropietario?: string;
  asesorResponsableId?: string;
};

const normalizarOrigen = (valor?: string): OrigenPropiedad => {
  const normalizado = (valor ?? "ALVAS").trim().toUpperCase();
  if (!ORIGENES_PROPIEDAD.includes(normalizado as OrigenPropiedad)) {
    throw new PropiedadError("El origen de la propiedad no es valido.", "ORIGEN_INVALIDO");
  }
  return normalizado as OrigenPropiedad;
};

const normalizarEstado = (valor?: string): EstadoPropiedad => {
  const normalizado = (valor ?? "DISPONIBLE").trim().toUpperCase();
  if (!ESTADOS_PROPIEDAD.includes(normalizado as EstadoPropiedad)) {
    throw new PropiedadError("El estado de la propiedad no es valido.", "ESTADO_INVALIDO");
  }
  return normalizado as EstadoPropiedad;
};

const textoOpcional = (valor?: string): string | undefined => valor?.trim() || undefined;

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
    origen?: string;
    estado?: string;
    idLeadOrigen?: string;
    idClientePropietario?: string;
    captadaPorAsesorId?: string;
    asesorResponsableId?: string;
  }): Propiedad {
    const ahora = new Date();
    return new Propiedad({
      id: idPropiedad(params.id),
      titulo: params.titulo.trim(),
      descripcion: params.descripcion.trim(),
      precio: params.precio,
      origen: normalizarOrigen(params.origen),
      estado: normalizarEstado(params.estado),
      idLeadOrigen: textoOpcional(params.idLeadOrigen),
      idClientePropietario: textoOpcional(params.idClientePropietario),
      captadaPorAsesorId: params.captadaPorAsesorId
        ? (textoOpcional(params.captadaPorAsesorId) as IdUsuarioRef)
        : undefined,
      asesorResponsableId: params.asesorResponsableId
        ? (textoOpcional(params.asesorResponsableId) as IdUsuarioRef)
        : undefined,
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
  get origen(): OrigenPropiedad {
    return this.props.origen;
  }
  get estado(): EstadoPropiedad {
    return this.props.estado;
  }
  get idLeadOrigen(): string | undefined {
    return this.props.idLeadOrigen;
  }
  get idClientePropietario(): string | undefined {
    return this.props.idClientePropietario;
  }
  get captadaPorAsesorId(): IdUsuarioRef | undefined {
    return this.props.captadaPorAsesorId;
  }
  get asesorResponsableId(): IdUsuarioRef | undefined {
    return this.props.asesorResponsableId;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  actualizar(datos: DatosPropiedad): void {
    if (datos.titulo !== undefined) {
      const titulo = datos.titulo.trim();
      if (!titulo) {
        throw new PropiedadError("El titulo de la propiedad es obligatorio.", "TITULO_INVALIDO");
      }
      this.props.titulo = titulo;
    }

    if (datos.descripcion !== undefined) {
      this.props.descripcion = datos.descripcion.trim();
    }

    if (datos.precio !== undefined) {
      if (datos.precio < 0) {
        throw new PropiedadError(
          "El precio de la propiedad no puede ser negativo.",
          "PRECIO_INVALIDO",
        );
      }
      this.props.precio = datos.precio;
    }

    if (datos.estado !== undefined) {
      this.props.estado = normalizarEstado(datos.estado);
    }

    if (datos.idClientePropietario !== undefined) {
      this.props.idClientePropietario = textoOpcional(datos.idClientePropietario);
    }

    if (datos.asesorResponsableId !== undefined) {
      this.props.asesorResponsableId = textoOpcional(datos.asesorResponsableId) as
        | IdUsuarioRef
        | undefined;
    }

    this.props.actualizadoEn = new Date();
  }
}

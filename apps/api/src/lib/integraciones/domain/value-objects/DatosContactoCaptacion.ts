import { ErrorDeValidacion } from "../../../shared/domain";

type DatosContactoProps = Readonly<{
  nombre: string;
  telefono: string;
  email?: string;
}>;

export class DatosContactoCaptacion {
  private constructor(private readonly props: DatosContactoProps) {}

  static crear(input: DatosContactoProps): DatosContactoCaptacion {
    const nombre = input.nombre.trim();
    const telefono = input.telefono.trim();
    const email = input.email?.trim().toLowerCase() || undefined;

    if (!nombre) {
      throw new ErrorDeValidacion("El nombre de contacto es obligatorio.");
    }

    if (!telefono) {
      throw new ErrorDeValidacion("El telefono de contacto es obligatorio.");
    }

    return new DatosContactoCaptacion({ nombre, telefono, email });
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get telefono(): string {
    return this.props.telefono;
  }

  get email(): string | undefined {
    return this.props.email;
  }
}

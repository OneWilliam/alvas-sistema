import {
  type IRegistroPropiedadCaptacion,
  type RegistroPropiedadCaptacionInput,
} from "../../../integraciones/domain/ports/IRegistroPropiedadCaptacion";
import { resultadoExitoso, type Resultado } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { Propiedad } from "../../domain/entities";
import { type IPropiedadRepository } from "../../domain/ports";

export class RegistroPropiedadCaptacionAdapter implements IRegistroPropiedadCaptacion {
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async registrar(
    input: RegistroPropiedadCaptacionInput,
  ): Promise<Resultado<{ id: string }, ErrorDeDominio>> {
    const titulo = input.metadata?.tituloPropiedad ?? `Propiedad captada - ${input.nombreContacto}`;
    const descripcion =
      input.metadata?.descripcionPropiedad ??
      `Propiedad preliminar originada desde ${input.origen}.`;
    const precio = Number(input.metadata?.precioEstimado ?? "0");

    const propiedad = Propiedad.crear({
      id: this.generadorId.generar(),
      titulo,
      descripcion,
      precio: Number.isFinite(precio) ? precio : 0,
      origen: "CAPTACION",
      estado: "PRELIMINAR",
      idLeadOrigen: input.idLeadOrigen,
      captadaPorAsesorId: input.asesorCaptadorId,
      asesorResponsableId: input.asesorCaptadorId,
    });

    await this.propiedadRepository.guardar(propiedad);
    return resultadoExitoso({ id: propiedad.id as string });
  }
}

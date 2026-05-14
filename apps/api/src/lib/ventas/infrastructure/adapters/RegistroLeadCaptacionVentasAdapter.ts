import {
  type IRegistroLeadCaptacion,
  type RegistroLeadCaptacionInput,
} from "../../../integraciones/domain/ports/IRegistroLeadCaptacion";
import { type Resultado, resultadoExitoso } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";
import { type IRegistrarLead } from "../../application";

export class RegistroLeadCaptacionVentasAdapter implements IRegistroLeadCaptacion {
  constructor(private readonly registrarLead: IRegistrarLead) {}

  async registrar(
    input: RegistroLeadCaptacionInput,
  ): Promise<Resultado<{ id: string; idAsesor: string }, ErrorDeDominio>> {
    const resultado = await this.registrarLead.ejecutar({
      nombre: input.nombre,
      email: input.email ?? `${input.telefono}@contacto.${input.canal.toLowerCase()}.local`,
      telefono: input.telefono,
      tipo: input.tipo,
      idAsesor: input.idAsesor,
      idPropiedadInteres: input.idPropiedadInteres,
    });

    if (!resultado.esExito) {
      return resultado;
    }

    return resultadoExitoso({
      id: resultado.valor.id as string,
      idAsesor: resultado.valor.idAsesor as string,
    });
  }
}

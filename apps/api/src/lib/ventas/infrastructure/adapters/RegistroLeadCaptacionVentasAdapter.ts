import {
  type IRegistroLeadCaptacion,
  type RegistroLeadCaptacionInput,
} from "../../../integraciones/domain/ports/IRegistroLeadCaptacion";
import { type Resultado, resultadoExitoso } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { EvaluarLeadParaAsignarUseCase, RegistrarLeadUseCase } from "../../application";
import { D1VentasRepository } from "../persistence/D1VentasRepository";

export class RegistroLeadCaptacionVentasAdapter implements IRegistroLeadCaptacion {
  constructor(private readonly db: D1DatabaseLike) {}

  async registrar(
    input: RegistroLeadCaptacionInput,
  ): Promise<Resultado<{ id: string }, ErrorDeDominio>> {
    const repo = new D1VentasRepository(this.db);
    const generadorId = new UuidGeneradorId();
    const evaluador = new EvaluarLeadParaAsignarUseCase(repo);
    const useCase = new RegistrarLeadUseCase(repo, generadorId, evaluador);
    const resultado = await useCase.ejecutar({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      tipo: input.tipo,
      idAsesor: input.idAsesor,
      idPropiedadInteres: input.idPropiedadInteres,
    });

    if (!resultado.esExito) {
      return resultado;
    }

    return resultadoExitoso({ id: resultado.valor.id as string });
  }
}

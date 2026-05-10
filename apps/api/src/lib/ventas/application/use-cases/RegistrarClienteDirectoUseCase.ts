import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cliente } from "../../domain/entities/Cliente";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";

export type RegistrarClienteDirectoInput = {
  nombre: string;
  email: string;
  telefono: string;
  idAsesor: string;
};

export class RegistrarClienteDirectoUseCase implements CasoDeUso<RegistrarClienteDirectoInput, Resultado<Cliente, ErrorDeDominio>> {
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async ejecutar(input: RegistrarClienteDirectoInput): Promise<Resultado<Cliente, ErrorDeDominio>> {
    try {
      const cliente = Cliente.crear({
        id: this.generadorId.generar(),
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        idAsesor: idUsuarioRef(input.idAsesor),
      });

      await this.repository.guardarCliente(cliente);

      return resultadoExitoso(cliente);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

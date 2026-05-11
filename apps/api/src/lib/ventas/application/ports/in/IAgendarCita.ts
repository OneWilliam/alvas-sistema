import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type AgendarCitaInput } from "../../use-cases/AgendarCitaUseCase";

export interface IAgendarCita {
  ejecutar(input: AgendarCitaInput): Promise<Resultado<void, ErrorDeDominio>>;
}

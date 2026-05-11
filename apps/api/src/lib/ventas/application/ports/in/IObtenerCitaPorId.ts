import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cita } from "../../../domain/entities/Cita";
import { type ObtenerCitaPorIdInputDTO } from "../../dto/LeadDTOs";

export interface IObtenerCitaPorId {
  ejecutar(input: ObtenerCitaPorIdInputDTO): Promise<Resultado<Cita, ErrorDeDominio>>;
}

import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ReporteGeneralOutput } from "../../dto/ReportesSalidaDTOs";

export interface IObtenerReporteGeneral {
  ejecutar(): Promise<Resultado<ReporteGeneralOutput, ErrorDeDominio>>;
}

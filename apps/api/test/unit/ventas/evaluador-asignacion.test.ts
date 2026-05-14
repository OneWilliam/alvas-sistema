import { describe, expect, test } from "bun:test";

import { idUsuarioRef } from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { EvaluadorAsignacionService } from "../../../src/lib/ventas/domain/services/EvaluadorAsignacion";

describe("ventas / EvaluadorAsignacionService", () => {
  test("elige el asesor con menor carga de leads", () => {
    const evaluador = new EvaluadorAsignacionService();
    const resultado = evaluador.evaluar([
      { idAsesor: "asesor-1", totalLeads: 8 },
      { idAsesor: "asesor-2", totalLeads: 2 },
      { idAsesor: "asesor-3", totalLeads: 4 },
    ]);

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor).toBe(idUsuarioRef("asesor-2"));
    }
  });

  test("falla si no hay asesores disponibles", () => {
    const resultado = new EvaluadorAsignacionService().evaluar([]);

    expect(resultado.esExito).toBe(false);
  });
});

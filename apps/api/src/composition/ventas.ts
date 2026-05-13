import {
  ActualizarCitaUseCase,
  ActualizarLeadUseCase,
  AgendarCitaUseCase,
  ConvertirLeadAClienteUseCase,
  ListarLeadsPorAsesorUseCase,
  RegistrarClienteDirectoUseCase,
  RegistrarLeadUseCase,
  type IRegistrarLead,
} from "../lib/ventas/application";
import { D1VentasRepository, type VentasControllerDeps } from "../lib/ventas/infrastructure";
import { type D1DatabaseLike } from "../lib/shared/infrastructure";
import { UuidGeneradorId } from "../lib/shared/infrastructure/security/UuidGeneradorId";
import { EvaluadorAsignacionService } from "../lib/ventas/domain/services/IEvaluadorAsignacion";

export function crearRegistrarLeadUseCase(db: D1DatabaseLike): IRegistrarLead {
  const repo = new D1VentasRepository(db);
  return new RegistrarLeadUseCase(repo, new UuidGeneradorId(), new EvaluadorAsignacionService());
}

export function crearVentasControllerDeps(): VentasControllerDeps {
  return {
    crearRegistrarLead: (c) => crearRegistrarLeadUseCase(c.env.DB),
    crearAgendarCita: (c) =>
      new AgendarCitaUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearRegistrarClienteDirecto: (c) =>
      new RegistrarClienteDirectoUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearConvertirLeadACliente: (c) =>
      new ConvertirLeadAClienteUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearActualizarLead: (c) => new ActualizarLeadUseCase(new D1VentasRepository(c.env.DB)),
    crearActualizarCita: (c) => new ActualizarCitaUseCase(new D1VentasRepository(c.env.DB)),
    crearListarLeadsPorAsesor: (c) =>
      new ListarLeadsPorAsesorUseCase(new D1VentasRepository(c.env.DB)),
  };
}

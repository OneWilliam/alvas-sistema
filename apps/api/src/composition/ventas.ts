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
import { EvaluadorAsignacionService } from "../lib/ventas/domain/services/EvaluadorAsignacion";
import { AutorizadorVentasAdapter } from "../lib/ventas/infrastructure/security/AutorizadorVentasAdapter";
import {
  ConsultaPropiedadInteresVentasAdapter,
  D1PropiedadRepository,
} from "../lib/propiedades/infrastructure";

function crearConsultaPropiedadInteres(db: D1DatabaseLike) {
  return new ConsultaPropiedadInteresVentasAdapter(new D1PropiedadRepository(db));
}

export function crearRegistrarLeadUseCase(db: D1DatabaseLike): IRegistrarLead {
  const repo = new D1VentasRepository(db);
  return new RegistrarLeadUseCase(
    repo,
    new UuidGeneradorId(),
    new EvaluadorAsignacionService(),
    new AutorizadorVentasAdapter(),
    crearConsultaPropiedadInteres(db),
  );
}

export function crearVentasControllerDeps(): VentasControllerDeps {
  const autorizador = new AutorizadorVentasAdapter();

  return {
    crearRegistrarLead: (c) => crearRegistrarLeadUseCase(c.env.DB),
    crearAgendarCita: (c) =>
      new AgendarCitaUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId(), autorizador),
    crearRegistrarClienteDirecto: (c) =>
      new RegistrarClienteDirectoUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearConvertirLeadACliente: (c) =>
      new ConvertirLeadAClienteUseCase(
        new D1VentasRepository(c.env.DB),
        new UuidGeneradorId(),
        autorizador,
      ),
    crearActualizarLead: (c) =>
      new ActualizarLeadUseCase(
        new D1VentasRepository(c.env.DB),
        autorizador,
        crearConsultaPropiedadInteres(c.env.DB),
      ),
    crearActualizarCita: (c) =>
      new ActualizarCitaUseCase(new D1VentasRepository(c.env.DB), autorizador),
    crearListarLeadsPorAsesor: (c) =>
      new ListarLeadsPorAsesorUseCase(new D1VentasRepository(c.env.DB)),
  };
}

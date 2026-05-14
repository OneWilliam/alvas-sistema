import { describe, expect, test } from "bun:test";

import { IniciarSesionUseCase } from "../../../src/lib/auth/application/use-cases/IniciarSesionUseCase";
import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import {
  type CredencialesUsuario,
  type IConsultaCredencialesUsuario,
  type ITokenProvider,
  type IVerificadorDeClave,
} from "../../../src/lib/auth/domain/ports";
import { type SessionClaims } from "../../../src/lib/shared/infrastructure/session";
import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";
import { CrearUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/CrearUsuarioUseCase";
import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import {
  type IPasswordHasher,
  type IUsuarioRepository,
} from "../../../src/lib/usuarios/domain/ports";
import { HashClave, IdUsuario, Username } from "../../../src/lib/usuarios/domain/value-objects";
import { AgendarCitaUseCase } from "../../../src/lib/ventas/application/use-cases/AgendarCitaUseCase";
import { ConvertirLeadAClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ConvertirLeadAClienteUseCase";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IdCliente, type IdLead } from "../../../src/lib/ventas/domain/value-objects/Ids";
import {
  type IdUsuarioRef,
  idUsuarioRef,
} from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";

class SecuenciaGeneradorId implements IGeneradorId {
  private indice = 0;

  constructor(private readonly ids: string[]) {}

  generar(): string {
    return this.ids[this.indice++] ?? `id-${this.indice}`;
  }
}

class FakeVentasRepository implements IVentasRepository {
  readonly leads = new Map<string, Lead>();
  readonly clientes = new Map<string, Cliente>();
  readonly actividades: string[] = [];

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async guardarLead(lead: Lead): Promise<void> {
    this.leads.set(lead.id, lead);
  }

  async listarLeads(): Promise<Lead[]> {
    return [...this.leads.values()];
  }

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.estado.valor === estado);
  }

  async obtenerClientePorId(id: IdCliente): Promise<Cliente | null> {
    return this.clientes.get(id) ?? null;
  }

  async guardarCliente(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.id, cliente);
  }

  async listarClientes(): Promise<Cliente[]> {
    return [...this.clientes.values()];
  }

  async listarClientesPorAsesor(idAsesor: IdUsuarioRef): Promise<Cliente[]> {
    return [...this.clientes.values()].filter((cliente) => cliente.idAsesor === idAsesor);
  }

  async registrarActividad(_idLead: IdLead, evento: string): Promise<void> {
    this.actividades.push(evento);
  }

  async obtenerActividadReciente(): Promise<
    { idLead: string; evento: string; descripcion: string; fecha: string }[]
  > {
    return [];
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [{ idAsesor: idUsuarioRef("asesor-1"), totalLeads: this.leads.size }];
  }
}

class FakeUsuarioRepository implements IUsuarioRepository {
  readonly usuarios = new Map<string, Usuario>();

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    return this.usuarios.get(id.valor) ?? null;
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    return this.usuarios.has(id.valor);
  }

  async guardar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id.valor, usuario);
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    this.usuarios.delete(id.valor);
  }

  async listar(): Promise<Usuario[]> {
    return [...this.usuarios.values()];
  }

  async obtenerPorUsername(username: Username): Promise<Usuario | null> {
    return (
      [...this.usuarios.values()].find((usuario) => usuario.username.valor === username.valor) ??
      null
    );
  }

  async existePorUsername(username: Username): Promise<boolean> {
    return (await this.obtenerPorUsername(username)) !== null;
  }
}

class FakePasswordHasher implements IPasswordHasher {
  async hashear(): Promise<HashClave> {
    return new HashClave("hash-seguro-001");
  }

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    return clavePlana === "secreto" && hashGuardado === "hash-seguro-001";
  }
}

class FakeConsultaCredenciales implements IConsultaCredencialesUsuario {
  constructor(private readonly usuario: CredencialesUsuario | null) {}

  async buscarPorId(): Promise<CredencialesUsuario | null> {
    return this.usuario;
  }

  async buscarPorUsername(username: string): Promise<CredencialesUsuario | null> {
    return this.usuario?.username === username ? this.usuario : null;
  }
}

class FakeVerificadorDeClave implements IVerificadorDeClave {
  constructor(private readonly coincide: boolean) {}

  async comparar(): Promise<boolean> {
    return this.coincide;
  }
}

class FakeTokenProvider implements ITokenProvider {
  generarAuthToken(): AuthToken {
    return new AuthToken("auth-token");
  }

  generarRefreshToken(): RefreshToken {
    return new RefreshToken("refresh-token");
  }

  validarAuthToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }

  validarRefreshToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }
}

function crearLead(id = "lead-001"): Lead {
  return Lead.registrar({
    id,
    nombre: "Maria",
    email: "maria@example.com",
    telefono: "999888777",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
}

describe("Use cases con fakes in-memory", () => {
  test("CrearUsuarioUseCase guarda usuario con hash generado", async () => {
    const repo = new FakeUsuarioRepository();
    const resultado = await new CrearUsuarioUseCase(repo, new FakePasswordHasher()).ejecutar({
      idUsuario: "user-001",
      username: "Asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.usuarios.size).toBe(1);
    if (resultado.esExito) {
      expect(resultado.valor.username.valor).toBe("asesor1");
      expect(resultado.valor.hashClave.valor).toBe("hash-seguro-001");
    }
  });

  test("CrearUsuarioUseCase rechaza usernames duplicados", async () => {
    const repo = new FakeUsuarioRepository();
    const useCase = new CrearUsuarioUseCase(repo, new FakePasswordHasher());

    await useCase.ejecutar({
      idUsuario: "user-001",
      username: "asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });
    const duplicado = await useCase.ejecutar({
      idUsuario: "user-002",
      username: "asesor1",
      nombre: "Asesor Dos",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(duplicado.esExito).toBe(false);
  });

  test("IniciarSesionUseCase emite tokens para credenciales validas", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "ACTIVO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: " Asesor1 ", clave: " secreto " });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.authToken).toBe("auth-token");
      expect(resultado.valor.usuario.username).toBe("asesor1");
    }
  });

  test("IniciarSesionUseCase rechaza usuarios deshabilitados", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "DESHABILITADO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: "asesor1", clave: "secreto" });

    expect(resultado.esExito).toBe(false);
  });

  test("AgendarCitaUseCase agrega cita al lead y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.citas).toHaveLength(1);
    expect(repo.actividades).toContain("CITA_AGENDADA");
  });

  test("ConvertirLeadAClienteUseCase crea cliente y cierra lead", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
    ).ejecutar({ idLead: "lead-001" });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
    expect(lead?.estado.valor).toBe("CONVERTIDO");
    expect(repo.actividades).toContain("CONVERTIDO_A_CLIENTE");
  });
});

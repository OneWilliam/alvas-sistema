# Evidencia de Ejecucion BDD

Comando ejecutado:

```bash
bun --cwd apps/api test:bdd
```

Resultado:

```text
6 scenarios (6 passed)
20 steps (20 passed)
0m00.322s (executing steps: 0m00.217s)
```

Interpretacion:

- Los escenarios Gherkin fueron procesados correctamente por Cucumber.
- Los seis escenarios definidos pasaron contra la logica del MVP.
- La ejecucion valida flujos de captacion de leads, agendamiento de citas y conversion de lead a cliente.
- Los steps ejercitan casos de uso y reglas de dominio sin depender de HTTP, base de datos ni interfaz grafica.

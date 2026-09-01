import Database from "better-sqlite3";

import { buscaContaPorId } from "../services/consulta.js";


let idDoFabio 

const dbTest = new Database(":memory:")
beforeAll(() => {
  
  dbTest.pragma(`foreign_keys = ON`)

  dbTest.exec(`
    CREATE TABLE IF NOT EXISTS CONTA(
    ContaId INTEGER PRIMARY KEY,
    Titular TEXT NOT NULL,
    Saldo NUMERIC NOT NULL CHECK (Saldo >= 0)
    ) 
    `)
})

beforeEach(() => {
  dbTest.exec(`DELETE FROM Conta`)

  const criaConta = dbTest.prepare(`
    INSERT INTO Conta (Titular, Saldo)
    VALUES (?, ?)
    `)

    criaConta.run("Fabio", 1200)

  const buscaConta = dbTest.prepare(`
    SELECT ContaId
    FROM Conta
    WHERE Titular = ?
    `)

  idDoFabio = buscaConta.get("Fabio").ContaId
})

afterAll(() => {
  dbTest.close()
})

describe("Teste de consultas", () => {
  it("Deve ser capaz de realizar a busca pelo Id", () => {
    const resultado = buscaContaPorId(dbTest, idDoFabio)

  expect(resultado).toBeDefined()
  expect(resultado.ContaId).toBe(1)
  expect(resultado.Saldo).toBe(1200)
  })
})

describe("Testando lógica quebrada", () => {
  it("Não deve ser capaz de buscar id inexistente", () => {
    const idInexistente = 123
    expect(() => {
      buscaContaPorId(dbTest, idInexistente)
    }).toThrow("O id da conta não existe")
  })

  it("Não deve ser capaz de consultar id inválido", () => {
    const idInvalido = "id-invalido"

    expect(() => {
      buscaContaPorId(dbTest, idInvalido)
    }).toThrow("Formato do id inválido")
  })
})

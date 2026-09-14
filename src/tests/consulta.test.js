import Database from "better-sqlite3";

import { buscaContaPorUsuarioId } from "../services/consulta.js";
import { inicializaTabelas } from "../helpers/setupDb.js";


let idDoFabio 

const dbTest = new Database(":memory:")

beforeAll(() => {
  
  inicializaTabelas(dbTest)
})

beforeEach(() => {
  dbTest.exec(`DELETE FROM Conta`)
  dbTest.exec(`DELETE FROM Usuario`)

  const criaUsuario = dbTest.prepare(`
    INSERT INTO Usuario (Email, Senha)
    VALUES (?, ?)
    `)

  const userFabio = criaUsuario.run("fabio@email.com", "senha1563")

  idDoFabio = userFabio.lastInsertRowid

  const criaConta = dbTest.prepare(`
    INSERT INTO Conta (Titular, Saldo, UsuarioId)
    VALUES (?, ?, ?)
    `)

    criaConta.run("Fabio", 1200, idDoFabio)
})

afterAll(() => {
  dbTest.close()
})

describe("Teste de consultas", () => {
  it("Deve ser capaz de realizar a busca pelo Id", () => {
    const resultado = buscaContaPorUsuarioId(dbTest, idDoFabio)

  expect(resultado).toBeDefined()
  expect(resultado.UsuarioId).toBe(idDoFabio)
  expect(resultado.Saldo).toBe(1200)
  })
})

describe("Testando lógica quebrada", () => {
  it("Não deve ser capaz de buscar id inexistente", () => {
    const idInexistente = 123
    expect(() => {
      buscaContaPorUsuarioId(dbTest, idInexistente)
    }).toThrow("Nenhuma conta encontrada para este usuario")
  })

  it("Não deve ser capaz de consultar id inválido", () => {
    const idInvalido = "id-invalido"

    expect(() => {
      buscaContaPorUsuarioId(dbTest, idInvalido)
    }).toThrow("Formato do id inválido")
  })
})

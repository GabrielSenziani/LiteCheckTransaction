import Database from "better-sqlite3";
import { criaContaDoUsuario } from "../services/criaConta.js";
import { inicializaTabelas } from "../helpers/setupDb.js";
import { criaUsuario, criaConta } from "../helpers/criaUsuarioEContaSetup.js";

let usuarioId
let contaId

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
})

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec(`DELETE FROM Conta`)
    dbTest.exec(`DELETE FROM Usuario`)

  usuarioId = criaUsuario(dbTest, "novoUser@email.com", "senha1236")
  contaId = criaConta(dbTest, "ContaNova", 200, usuarioId)
})

afterAll(() => {
    dbTest.close()
})

describe("Teste de criação de conta - Ganha conta nova", () => {
    it("Deve ser capaz de criar uma conta nova", () => {
        const idDaConta = criaContaDoUsuario(dbTest, usuarioId, "ContaNovaSegundo")

        expect(idDaConta).toBeDefined()

        const verificaTabelaDeContas = dbTest.prepare(`
            SELECT Titular, Saldo, UsuarioId
            FROM Conta
            WHERE ContaId = ?
            `).get(idDaConta)

        expect(verificaTabelaDeContas.Titular).toBe("ContaNovaSegundo")
        expect(verificaTabelaDeContas.Saldo).toBe(0)
        expect(verificaTabelaDeContas.UsuarioId).toBe(usuarioId)
    })
})
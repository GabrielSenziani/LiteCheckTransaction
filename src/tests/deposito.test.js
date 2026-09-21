import Database from "better-sqlite3";

import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";
import { criaUsuario, criaConta } from "../helpers/criaUsuarioEContaSetup.js";

let idUser
let idIsca
let idContaComSaldo
let idContaSemSaldo
let idContaIsca

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
})

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec(`DELETE FROM Conta`)
    dbTest.exec(`DELETE FROM Usuario`)

    idUser = criaUsuario(dbTest, "user3@email.com", "senhaSuperSecreta123")
    idContaSemSaldo = criaConta(dbTest, "UserNovo", 0, idUser)
    idContaComSaldo = criaConta(dbTest, "UserNovoSegundo", 100, idUser)

    idIsca = criaUsuario(dbTest, "isca@email.com", "senhaDoIsca222")
    idContaIsca = criaConta(dbTest, "contadoIsca", 100, idIsca)
})

afterAll(() => {
    dbTest.close()
})

describe("Teste de Depósito - Bem sucedido", () => {
    it("Esperado que o depósito seja bem sucedido", () => {
        const resultado = depositaDinheiro(dbTest, idUser, 100, idContaSemSaldo)

        const contaDoUsuario = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idContaSemSaldo)

        expect(contaDoUsuario.Saldo).toBe(100)
        expect(resultado).toBe(true)
    })
})

describe("Teste de Depósito - Mal sucedido", () => {
    it("Não deve ser capaz de realizar deposito com valor 0", () => {
        expect(() => {
            depositaDinheiro(dbTest, idUser, 0, idContaSemSaldo)
        }).toThrow("O valor para realizar o depósito precisa ser maior que 0")

        const contaDoUsuarioSemSaldo = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idContaSemSaldo)

            expect(contaDoUsuarioSemSaldo.Saldo).toBe(0)
    })

   it("Não deve ser capaz de realizar deposito com valor negativo", () => {
    expect(() => {
        depositaDinheiro(dbTest, idUser, -1, idContaSemSaldo)
    }).toThrow("O valor para realizar o depósito precisa ser maior que 0")

    const contaUser = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaSemSaldo)

    expect(contaUser.Saldo).toBe(0)
   })

   it("Não deve ser capaz de realizar o deposito para um id inválido", () => {
    const idInexistente = "meu-id-nada-haver"

    expect(() => {
        depositaDinheiro(dbTest, idUser, 10000, idInexistente)
    }).toThrow("A conta não foi encontrada ou você não possui permissão para depositar nesta conta.")
   })

   it("Não deve ser capaz de realizar um deposito a uma conta que não pertence ao usuario", () => {
    expect(() => {
        depositaDinheiro(dbTest, idUser, 200, idContaIsca)
    }).toThrow("A conta não foi encontrada ou você não possui permissão para depositar nesta conta")
   })
})
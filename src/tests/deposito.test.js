import Database from "better-sqlite3";

import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

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

    criaUsuario = dbTest.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const userIsca = criaUsuario.run("isca@email.com", "senhaDoIsca222")

    const user = criaUsuario.run("user3@email.com", "senhaSuperSecreta123")

    idUser = user.lastInsertRowid
    idIsca = userIsca.lastInsertRowid

    criaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    idContaSemSaldo = criaConta.run("UserNovo", 0, idUser).lastInsertRowid
    idContaComSaldo = criaConta.run("UserNovoSegundo", 100, idUser).lastInsertRowid
    idContaIsca = criaConta.run("contadoIsca", 100, idIsca).lastInsertRowid
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
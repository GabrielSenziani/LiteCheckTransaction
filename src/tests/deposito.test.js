import Database from "better-sqlite3";

import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

let idUser
let idTeste

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

    const user = criaUsuario.run("user3@email.com", "senhaSuperSecreta123")

    idUser = user.lastInsertRowid

    criaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    criaConta.run("UserNovo", 0, idUser)
})

afterAll(() => {
    dbTest.close()
})

describe("Teste de Depósito - Bem sucedido", () => {
    it("Esperado que o depósito seja bem sucedido", () => {
        const resultado = depositaDinheiro(dbTest, idUser, 100, idUser)

        const contaDoUsuario = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE UsuarioId = ?
            `).get(idUser)

        expect(contaDoUsuario.Saldo).toBe(100)
        expect(resultado).toBe(true)
    })
})

describe("Teste de Depósito - Mal sucedido", () => {
    it("Não deve ser capaz de realizar deposito com valor 0", () => {
        expect(() => {
            depositaDinheiro(dbTest, idUser, 0, idUser)
        }).toThrow("O valor para realizar o depósito precisa ser maior que 0")

        const contaDoUsuarioSemSaldo = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE UsuarioId = ?
            `).get(idUser)

            expect(contaDoUsuarioSemSaldo.Saldo).toBe(0)
    })

   it("Não deve ser capaz de realizar deposito com valor negativo", () => {
    expect(() => {
        depositaDinheiro(dbTest, idUser, -1, idUser)
    }).toThrow("O valor para realizar o depósito precisa ser maior que 0")

    const contaUser = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE UsuarioId = ?
        `).get(idUser)

    expect(contaUser.Saldo).toBe(0)
   })

   it("Não deve ser capaz de realizar deposito para uma conta que não seja de própria autoria", () => {
    const criaSegundoUsuario = dbTest.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const userDaVitima = criaSegundoUsuario.run("test@email.com", "senha121223")

    idTeste = userDaVitima.lastInsertRowid

    const criaSegundaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    criaSegundaConta.run("Teste", 100, idTeste)

    expect(() => {
        depositaDinheiro(dbTest, idUser, 200, idTeste)
    }).toThrow("Você não tem permissão para depositar nesta conta")

    const contaVitima = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE UsuarioId = ?
        `).get(idTeste)

    expect(contaVitima.Saldo).toBe(100)

    
   })

   it("Não deve ser capaz de realizar o deposito para um id inválido", () => {
    const idInexistente = "meu-id-nada-haver"

    expect(() => {
        depositaDinheiro(dbTest, idUser, 10000, idInexistente)
    }).toThrow("Formato do id inválido")
   })

   it("Não deve ser capaz de realizar o deposito para um id inexistente", () => {
    const idInexistente = 22

    expect(() => {
        depositaDinheiro(dbTest, idUser, 10000, idInexistente)
    }).toThrow("O id da conta não existe")
   })
})
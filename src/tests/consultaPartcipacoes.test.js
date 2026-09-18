import Database from "better-sqlite3";
import { consultaParticipacoes } from "../services/consultaExtratos.js";
import { transferirDinheiro } from "../services/transferencia.js";
import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";
import { criaUsuario } from "../helpers/criaUsuarioEContaSetup.js";
import { criaConta } from "../helpers/criaUsuarioEContaSetup.js";

let idNovoUsuario
let idUsuarioIsca
let idContaNova
let idContaSegundaria
let idContaIsca

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
})

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec(`DELETE FROM Conta`)
    dbTest.exec(`DELETE FROM Usuario`)

    idNovoUsuario = criaUsuario(dbTest, "novoUsuario@email.com", "senhaDoNovo3211")
    idUsuarioIsca = criaUsuario(dbTest, "isca43@email.com", "senhaIsca2")

    idContaNova = criaConta(dbTest, "NewUser", 500, idNovoUsuario)
    idContaSegundaria = criaConta(dbTest, "segundariaDoNew", 700, idNovoUsuario)
    idContaIsca = criaConta(dbTest, "iscas", 900, idUsuarioIsca)
})

afterAll(() => {
    dbTest.close()
})

describe("Teste de consulta de participação - Sucesso nos casos", () => {
    it("Deve consultar a participação de contaNova ao realizar transferência para contaIsca", () => {
      transferirDinheiro(dbTest, idNovoUsuario, idContaNova, idContaIsca, 200)

      const confereSaldoA = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaNova)

      const confereSaldoB = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaIsca)

     expect(confereSaldoA.Saldo).toBe(300)
     expect(confereSaldoB.Saldo).toBe(1100)

     const resultado = consultaParticipacoes(dbTest, idNovoUsuario)

     expect(resultado).toHaveLength(1)
     expect(resultado[0].ContaId).toBe(idContaNova)
    })

    it("Deve consultar a participação das duas contas do New User ao realizar duas transferências diferentes", () => {
        transferirDinheiro(dbTest, idNovoUsuario, idContaNova, idContaIsca, 200)
        transferirDinheiro(dbTest, idNovoUsuario, idContaSegundaria, idContaIsca, 200)

        const confereSaldoA = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaNova)

        const confereSaldoB = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaSegundaria)

        const confereSaldoC = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaIsca)

        expect(confereSaldoA.Saldo).toBe(300)
        expect(confereSaldoB.Saldo).toBe(500)
        expect(confereSaldoC.Saldo).toBe(1300)

        const resultado = consultaParticipacoes(dbTest, idNovoUsuario)

        expect(resultado).toHaveLength(2)
        expect(resultado).toEqual(
            expect.arrayContaining([
             expect.objectContaining({ContaId: idContaNova}),
             expect.objectContaining({ContaId: idContaNova})   
            ])
        )
    })
})
import Database from "better-sqlite3";

import { consultaExtratos } from "../services/consultaExtratos.js";
import { transferirDinheiro } from "../services/transferencia.js";
import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";
import { criaUsuario, criaConta } from "../helpers/criaUsuarioEContaSetup.js";


let idUsuarioA
let idUsuarioB
let idContaA
let idContaB
let idContaReservaA

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
})

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec(`DELETE FROM Conta`)
    dbTest.exec(`DELETE FROM Usuario`)

    idUsuarioA = criaUsuario(dbTest, "userA@email.com", "senhaSegura123")
    idContaA = criaConta(dbTest, "Adolfo", 500, idUsuarioA)
    idContaReservaA = criaConta(dbTest, "ReservaA", 1000, idUsuarioA)

    idUsuarioB = criaUsuario(dbTest, "userB@email.com", "senha3332")
    idContaB = criaConta(dbTest, "Bernado", 600, idUsuarioB)
})

afterAll(() => {
    dbTest.close()
})

describe("Testando consulta de Extratos - Bem Sucedido", () => {
 it("UsuarioA realiza transferência para UsuarioB e é possivel consultar os extratos", () => {
    transferirDinheiro(dbTest, idUsuarioA, idContaA, idContaB, 300)
    
    const confereSaldoA = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaA)

    const confereSaldoB = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaB)

    expect(confereSaldoA.Saldo).toBe(200)
    expect(confereSaldoB.Saldo).toBe(900)
    

    const resultado = consultaExtratos(dbTest, idUsuarioA)

    expect(resultado).toHaveLength(1)
    expect(resultado[0].Tipo).toBe("Transferencia")
    expect(resultado[0].TitularOrigem).toBe("Adolfo")
    expect(resultado[0].TitularDestino).toBe("Bernado")
 })

 it("UsuarioA realiza transferencia para conta segundaria", () => {
   transferirDinheiro(dbTest, idUsuarioA, idContaA, idContaReservaA, 300)

    const confereSaldoA = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaA)

    const confereSaldoDaReserva = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaReservaA)

    expect(confereSaldoA.Saldo).toBe(200)
    expect(confereSaldoDaReserva.Saldo).toBe(1300)

    const resultado = consultaExtratos(dbTest, idUsuarioA)

    expect(resultado).toHaveLength(1)
    expect(resultado[0].Tipo).toBe("Transferencia")
    expect(resultado[0].TitularOrigem).toBe("Adolfo")
    expect(resultado[0].TitularDestino).toBe("ReservaA")
 })

 it("UsuarioA realiza deposito para a propria conta", () => {
    depositaDinheiro(dbTest, idUsuarioA, 100, idContaA)

    const confereDeposito = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaA)

    expect(confereDeposito.Saldo).toBe(600)

    const resultado = consultaExtratos(dbTest, idUsuarioA)

    expect(resultado).toHaveLength(1)
    expect(resultado[0].Tipo).toBe("Deposito")
    expect(resultado[0].TitularOrigem).toBeNull()
    expect(resultado[0].TitularDestino).toBe("Adolfo")
 })

 describe("Teste consulta de Extratos - Segurança e Isolamento", () => {
    it("Usuario não deve ser capaz de consultar um extrato caso não esteja autenticado", () => {
        const idUsuarioNaoAutenticado = 16
        const resultado = consultaExtratos(dbTest, idUsuarioNaoAutenticado)

        expect(resultado).toHaveLength(0)
    })

    it("UsuarioB não deve ser capaz de consultar os extratos de uma conta que não seja dele", () => {
        depositaDinheiro(dbTest, idUsuarioB, 500, idContaB)

        const resultado = consultaExtratos(dbTest, idUsuarioA)

        expect(resultado).toHaveLength(0)
    })
 })
})
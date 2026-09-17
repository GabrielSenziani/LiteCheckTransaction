import Database from "better-sqlite3";

import { consultaExtratos } from "../services/consultaExtratos.js";
import { transferirDinheiro } from "../services/transferencia.js";
import { depositaDinheiro } from "../services/deposito.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

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

    const criaUsuario = dbTest.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const userA = criaUsuario.run("userA@email.com", "senhaSegura123")
    idUsuarioA = userA.lastInsertRowid

    const userB = criaUsuario.run("userB@email.com", "senha3332")
    idUsuarioB = userB.lastInsertRowid

    const criaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    const contaA = criaConta.run("Adolfo", 500, idUsuarioA)
    idContaA = contaA.lastInsertRowid

    const contaB = criaConta.run("Bernado", 600, idUsuarioB)
    idContaB = contaB.lastInsertRowid

    const contaReservaA = criaConta.run("ReservaA", 1000, idUsuarioA)
    idContaReservaA = contaReservaA.lastInsertRowid
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
})
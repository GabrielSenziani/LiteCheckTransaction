import Database from "better-sqlite3";
import supertest from "supertest";

import { transferirDinheiro } from "../services/transferencia.js";

let idMarcela
let idIsadora

const dbTest = new Database("src/database/sqlite.test.db")

beforeAll(() => {
    dbTest.pragma("foreign_keys = ON");

    dbTest.exec(`
        CREATE TABLE IF NOT EXISTS Conta(
        ContaId INTEGER PRIMARY KEY,
        Titular TEXT NOT NULL,
        Saldo NUMERIC NOT NULL CHECK (Saldo >= 0)
        )
        `)
}) 

beforeEach(() => {
    dbTest.exec("DELETE FROM Conta");

    const criaContas = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo)
        VALUES (?, ?)
        `)

        criaContas.run("Marcela", 1700)
        criaContas.run("Isadora", 230)

    const buscaContas = dbTest.prepare(`
        SELECT ContaId
        FROM Conta
        WHERE Titular = ?
        `)

    idMarcela = buscaContas.get("Marcela").ContaId
    idIsadora = buscaContas.get("Isadora").ContaId
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica", () => {
    it("Marcela deve realizar uma transferência para Isadora", () => {
      const resultado = transferirDinheiro(dbTest, idMarcela, idIsadora, 500)

      const contaMarcela = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idMarcela)

     const contaIsadora = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idIsadora)

    expect(contaMarcela.Saldo).toBe(1200)
    expect(contaIsadora.Saldo).toBe(730)
    expect(resultado).toBe(true)
    })
})

describe("testando lógica falha", () => {
    it("Marcela não deve conseguir realizar a transferência por conta do Saldo insuficiente", () => {
        expect(() => {
          transferirDinheiro(dbTest, idMarcela, idIsadora, 7000)
        }).toThrow("Saldo insuficiente!")

        const contaMarcelaQuebrada = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idMarcela)

        const contaIsadoraTriste = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idIsadora)

    expect(contaMarcelaQuebrada.Saldo).toBe(1700)
    expect(contaIsadoraTriste.Saldo).toBe(230)
    })
})
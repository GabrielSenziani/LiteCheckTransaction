import Database from "better-sqlite3";

const dbTest = new Database("src/database/sqlite.test.db")

beforeAll(() => {
    dbTest.pragma("foreign_keys = ON");

    dbTest.exec(`
        CREATE TABLE IF NOT EXISTS ContaTest(
        ContaId INTEGER PRIMARY KEY,
        Titular TEXT NOT NULL,
        Saldo NUMERIC NOT NULL CHECK (Saldo >= 0)
        )
        `)
}) 

beforeEach(() => {
    dbTest.exec("DELETE FROM ContaTest");

    const criaContas = dbTest.prepare(`
        INSERT INTO ContaTest (Titular, Saldo)
        VALUES (?, ?)
        `)

        criaContas.run("Gabriel", 1700)
        criaContas.run("Isadora", 230)
})

afterAll(() => {
    dbTest.close()
})
import Database from "better-sqlite3";

import { transferirDinheiro } from "../services/transferencia.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

let idMarcela
let idIsadora
let idContaMarcela
let idContaIsadora

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
}) 

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec("DELETE FROM Conta");
    dbTest.exec("DELETE FROM Usuario");

    criUsuario = dbTest.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const userMarcela = criUsuario.run("marcela@email.com", "senha1234")
    const usarIsadora = criUsuario.run("isadora@email.com", "senha123")

    idMarcela = userMarcela.lastInsertRowid
    idIsadora = usarIsadora.lastInsertRowid

    const criaContas = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

        const contaDaMarcela = criaContas.run("Marcela", 1700, idMarcela)
        const contaDaIsadora = criaContas.run("Isadora", 230, idIsadora)

        idContaMarcela = contaDaMarcela.lastInsertRowid
        idContaIsadora = contaDaIsadora.lastInsertRowid
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica", () => {
    it("Marcela deve realizar uma transferência para Isadora", () => {
      const resultado = transferirDinheiro(dbTest, idContaMarcela, idContaIsadora, 500)

      const contaMarcela = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE Contaid = ?
        `).get(idContaMarcela)

     const contaIsadora = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaIsadora)

    expect(contaMarcela.Saldo).toBe(1200)
    expect(contaIsadora.Saldo).toBe(730)
    expect(resultado).toBe(true)
    })
})

describe("testando lógica falha", () => {
    it("Marcela não deve conseguir realizar a transferência por conta do Saldo insuficiente", () => {
        expect(() => {
          transferirDinheiro(dbTest, idContaMarcela, idContaIsadora, 7000)
        }).toThrow("Saldo insuficiente!")

        const contaMarcelaQuebrada = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idContaMarcela)

        const contaIsadoraTriste = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idContaIsadora)

    expect(contaMarcelaQuebrada.Saldo).toBe(1700)
    expect(contaIsadoraTriste.Saldo).toBe(230)
    })

   it("Marcela não deve conseguir realizar uma transferência com valor negativo", () => {
    expect(() => {
        transferirDinheiro(dbTest, idContaMarcela, idContaIsadora, -2000)
    }).toThrow("O valor para realizar a transferência precisa ser maior que 0")

    const transferenciaNegativa = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaMarcela)

    const naoRecebeValorNegativo = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaIsadora)

    expect(transferenciaNegativa.Saldo).toBe(1700)
    expect(naoRecebeValorNegativo.Saldo).toBe(230)
   })
})

describe("testando lógica falha de id", () => {
     const idInexistente = 9999

    it("Marcela não deve ser capaz de realizar tranferência para id inexistente", () => {
        expect(() => {
            transferirDinheiro(dbTest, idContaMarcela, idInexistente, 500) 
        }).toThrow("O id da conta não existe")

        const falhaMarcela = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idContaMarcela)

        const falhaIdInexistente = dbTest.prepare(`
            SELECT Saldo
            FROM Conta
            WHERE ContaId = ?
            `).get(idInexistente)

        expect(falhaMarcela.Saldo).toBe(1700)
        expect(falhaIdInexistente).toBeUndefined()
    })

   it("Marcela não deve ser capaz de realizar transferência para id inválido", () => {
    const idInvalido = "id-invalido"

    expect(() => {
        transferirDinheiro(dbTest, idContaMarcela, idInvalido, 400)
    }).toThrow("Formato do id inválido")

    const tranferênciaFalha = dbTest.prepare(`
    SELECT Saldo
    FROM Conta
    WHERE ContaId = ?
    `).get(idContaMarcela)

    const recebimentoFalho = dbTest.prepare(`
    SELECT Saldo
    FROM Conta
    WHERE ContaId = ?
    `).get(idInvalido)

  expect(tranferênciaFalha.Saldo).toBe(1700)
  expect(recebimentoFalho).toBeUndefined()
   })

   it("Marcela não deve ser capaz de realizar transferência para id com numero negativo", () => {
    const idNegativo = -1

    expect(() => {
        transferirDinheiro(dbTest, idContaMarcela, idNegativo, 500)
    }).toThrow("Formato do id inválido")

    const falhaNaTransferencia = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaMarcela)

    const idNegativoNaoRecebe = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idNegativo)

    expect(falhaNaTransferencia.Saldo).toBe(1700)
    expect(idNegativoNaoRecebe).toBeUndefined()
   })
})
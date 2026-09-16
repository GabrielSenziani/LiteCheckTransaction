import Database from "better-sqlite3";

import { transferirDinheiro } from "../services/transferencia.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

let idMarcela
let idIsadora
let idContaMarcela
let idContaIsadora
let idDaSegundaria

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
        const contaSegundariaDaMarcela = criaContas.run("MarcelaDois", 2000, idMarcela)

        idContaMarcela = contaDaMarcela.lastInsertRowid
        idContaIsadora = contaDaIsadora.lastInsertRowid
        idDaSegundaria = contaSegundariaDaMarcela.lastInsertRowid
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica", () => {
    it("Marcela deve ser capaz de realizar uma transferência para outra conta que seja dela", () => {
      const resultado = transferirDinheiro(dbTest, idMarcela, idContaMarcela, idDaSegundaria, 500)

      const contaMarcela = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaMarcela)

      const contaDaSegundaria = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idDaSegundaria)

      expect(contaMarcela.Saldo).toBe(1200)
      expect(contaDaSegundaria.Saldo).toBe(2500)
      expect(resultado).toBe(true)
    })

    it("Marcela deve realizar uma transferência para Isadora", () => {
      const resultado = transferirDinheiro(dbTest, idMarcela, idContaMarcela, idContaIsadora, 500)

      const contaMarcela = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
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
          transferirDinheiro(dbTest, idMarcela, idContaMarcela, idContaIsadora, 7000)
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
        transferirDinheiro(dbTest, idMarcela, idContaMarcela, idContaIsadora, -2000)
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
            transferirDinheiro(dbTest, idMarcela, idContaMarcela, idInexistente, 500) 
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
        transferirDinheiro(dbTest, idMarcela, idContaMarcela, idInvalido, 400)
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
        transferirDinheiro(dbTest, idMarcela, idContaMarcela, idNegativo, 500)
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

   it("Marcela não deve ser capaz de realizar uma transferêcia a partir da conta da Isadora", () => {
    expect(() => {
        transferirDinheiro(dbTest, idMarcela, idContaIsadora, idContaMarcela, 3000)
    }).toThrow("A conta não foi encontrada ou você não possui permissão para realizar uma transferencia apartir desta conta")

    const verificaSaldo = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaIsadora)

    const verificaSaldoDaMarcela = dbTest.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(idContaMarcela)

    expect(verificaSaldo.Saldo).toBe(230)
    expect(verificaSaldoDaMarcela.Saldo).toBe(1700)
   })
})
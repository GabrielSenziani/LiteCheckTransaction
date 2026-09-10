import Database from "better-sqlite3";

import { deletaDados } from "../services/deletaDados.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

let usuarioId
let alvoId

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

    const userParaDelete = criaUsuario.run("deletado123@email.com", "deletado222")

    usuarioId = userParaDelete.lastInsertRowid

    criaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    contaDeletada = criaConta.run("Deletado", 200, usuarioId)
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica sucedida - Delete de Dados", () => {
    it("Deve ser capaz de deletar os próprios dados", () => {
    const resultado = deletaDados(dbTest, usuarioId, usuarioId)

    expect(resultado).toBe(1) //se houve mudança ele sera 1, se nao, ele sera 0, é aquela coisa do changes
    })
})

describe("Testando lógica falha - Não consegue deletar dados por X motivos", () => {
 it("Não deve ser capaz de deletar os dados de outro Usuario", () => {
    const criaUsuarioAlvo = dbTest.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const usuarioAlvo = criaUsuarioAlvo.run("alvo123@email.com", "alvo333")

    alvoId = usuarioAlvo.lastInsertRowid

    const criaContaAlvo = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    criaContaAlvo.run("Alvo", 100, alvoId)

    expect(() => {
        deletaDados(dbTest, usuarioId, alvoId)
    }).toThrow(new Error("Você não tem permissão para excluir os dados desta conta"))
 })

it("Não deve ser capaz de deletar dados de um Usuario inexistente", () => {
    const idQualquer = 222

    expect(() => {
        deletaDados(dbTest, idQualquer, idQualquer)
    }).toThrow(new Error("O id da conta não existe"))
})

it("Não deve ser capaz de deletar dados buscando um id inválido", () => {
    const idQualquer = "um-id-qualquer"

    expect(() => {
        deletaDados(dbTest, idQualquer, idQualquer)
    }).toThrow(new Error("Formato do id inválido"))
})
})
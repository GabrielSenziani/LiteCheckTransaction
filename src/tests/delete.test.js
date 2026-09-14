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

describe("Testando lógica bem sucedida - Delete de Dados", () => {
    it("Deve ser capaz de deletar os próprios dados", () => {
    const resultado = deletaDados(dbTest, usuarioId)

    expect(resultado).toBeGreaterThan(0) //se houve mudança ele sera 1, se nao, ele sera 0, é aquela coisa do changes
    
    const usuarioNoBanco = dbTest.prepare(`SELECT * FROM Usuario WHERE UsuarioId = ?`).get(usuarioId)
    expect(usuarioNoBanco).toBeUndefined()
  })
})

describe("Testando lógica falha - Não consegue deletar dados por X motivos", () => {
it("Não deve ser capaz de deletar dados de um Usuario inexistente", () => {
    const idQualquer = 222

    expect(() => {
        deletaDados(dbTest, idQualquer)
    }).toThrow(new Error("Nenhuma conta encontrada para este usuario"))
})

it("Não deve ser capaz de deletar dados buscando um id inválido", () => {
    const idQualquer = "um-id-qualquer"

    expect(() => {
        deletaDados(dbTest, idQualquer, idQualquer)
    }).toThrow(new Error("Formato do id inválido"))
})
})
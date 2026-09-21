import Database from "better-sqlite3";

import { deletaUsuario } from "../services/deletaDados.js";
import { inicializaTabelas } from "../helpers/setupDb.js";
import { criaUsuario, criaConta } from "../helpers/criaUsuarioEContaSetup.js";

let usuarioId
let usuarioIdSemSaldo
let contaDeletada
let contaDeletadaDeVerdade

const dbTest = new Database(":memory:")

beforeAll(() => {
    inicializaTabelas(dbTest)
})

beforeEach(() => {
    dbTest.exec(`DELETE FROM Transacao`)
    dbTest.exec(`DELETE FROM Conta`)
    dbTest.exec(`DELETE FROM Usuario`)

    usuarioId = criaUsuario(dbTest, "deletado123@email.com", "deletado222")
    contaDeletada = criaConta(dbTest, "Deletado", 200, usuarioId)

    usuarioIdSemSaldo = criaUsuario(dbTest, "deleta111@email.com", "deleta333")
    contaDeletadaDeVerdade = criaConta(dbTest, "Deleção", 0, usuarioIdSemSaldo)
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica bem sucedida - Delete de Dados", () => {
    it("Deve ser capaz de deletar os próprios dados", () => {
    const resultado = deletaUsuario(dbTest, usuarioIdSemSaldo)

    expect(resultado).toBeGreaterThan(0) //se houve mudança ele sera 1, se nao, ele sera 0, é aquela coisa do changes
    
    const usuarioNoBanco = dbTest.prepare(`
        SELECT * 
        FROM Usuario 
        WHERE UsuarioId = ?
        `).get(usuarioIdSemSaldo)

    expect(usuarioNoBanco).toBeUndefined()
  })
})

describe("Testando lógica falha - Não consegue deletar dados por X motivos", () => {
it("Não deve ser capaz de deletar dados de um Usuario inexistente", () => {
    const idQualquer = 222

    expect(() => {
        deletaUsuario(dbTest, idQualquer)
    }).toThrow(new Error("Nenhuma conta encontrada para este usuario"))
})

it("Não deve ser capaz de deletar dados buscando um id inválido", () => {
    const idQualquer = "um-id-qualquer"

    expect(() => {
        deletaUsuario(dbTest, idQualquer, idQualquer)
    }).toThrow(new Error("Formato do id inválido"))
})

it("Não deve ser capaz de deletar os dados de uma conta que ainda possui saldo", () => {
    expect(() => {
        deletaUsuario(dbTest, usuarioId)
    }).toThrow(new Error("A conta não pode ser excluida pois possui saldo"))
})
})
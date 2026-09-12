import Database from "better-sqlite3";

import { atualizaDados } from "../services/atualizaDados.js";
import { inicializaTabelas } from "../helpers/setupDb.js";

let idUser
let idDoAlvo

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

    const user = criaUsuario.run("novouser@email.com", "senhanova333")

    idUser = user.lastInsertRowid

    criaConta = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    contaNova = criaConta.run("UsuarioNovo", 200, idUser)
})

afterAll(() => {
    dbTest.close()
})

describe("Testando lógica de sucesso - Atualização de dados", () => {
    it("Deve atualizar os dados do Usuario com sucesso", () => {
        const resultado = atualizaDados(dbTest, idUser, idUser, "emailnovo@email.com", "senhanova222")

        expect(resultado).toBe(idUser)

        const verificaTabela = dbTest.prepare(`
            SELECT Email 
            FROM Usuario
            WHERE UsuarioId = ?
            `).get(idUser)

        expect(verificaTabela.Email).toBe("emailnovo@email.com")
    })
})

describe("Testando lógica falha - Atualização de dados", () => {
    it("Não deve atualizar dados de um outro usuario", () => {
        const criaUsuarioAlvo = dbTest.prepare(`
            INSERT INTO Usuario (Email, Senha)
            VALUES (?, ?)
            `)

       usuarioAlvo = criaUsuarioAlvo.run("alvo123@email.com", "alvo5656")
       idDoAlvo = usuarioAlvo.lastInsertRowid

       const criaContaDoAlvo = dbTest.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

        criaContaDoAlvo.run("Alvin", 200, idDoAlvo)

    expect(() => {
        atualizaDados(dbTest, idUser, idDoAlvo)
    }).toThrow("Você não tem permissão para atualizar os dados desta conta")
  })

  it("Não deve ser capaz de atualizar os próprios dados sem colocar nenhum dado", () => {
    expect(() => {
      atualizaDados(dbTest, idUser, idUser)
    }).toThrow("É necessário preencher os campos Email e senha")
  })

  it("Não deve ser capaz de alterar o email para um email inválido", () => {
    expect(() => {
     atualizaDados(dbTest, idUser, idUser, "email111.com", "senhanova111")
    }).toThrow(new Error("Formato do email inválido"))

    const verificaEmail = dbTest.prepare(`
        SELECT Email
        FROM Usuario
        WHERE UsuarioId = ?
        `).get(idUser)

    expect(verificaEmail.Email).toBe("novouser@email.com")
  })

    it("Não deve ser capaz de alterar a senha para uma senha inválida", () => {
    expect(() => {
     atualizaDados(dbTest, idUser, idUser, "email111@email.com", "123")
    }).toThrow(new Error("É necessário que a senha tenha pelo menos 6 digitos"))

    const verificaSenha = dbTest.prepare(`
        SELECT Senha
        FROM Usuario
        WHERE UsuarioId = ?
        `).get(idUser)

    expect(verificaSenha.Senha).toBe("senhanova333")
  })
})
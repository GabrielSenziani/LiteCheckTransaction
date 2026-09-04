import JWT from "jsonwebtoken"
import supertest from "supertest"
import app from "../server.js"
import db from "../database/database.js"

let usuarioId


beforeEach(() => {
    db.exec("DELETE FROM Conta")
    db.exec("DELETE FROM Usuario")

    const criaUsuario = db.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const user = criaUsuario.run("userTest@email.com", "user123")

    usuarioId = user.lastInsertRowid

    const criaConta = db.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    criaConta.run("User", 200, usuarioId)
})

describe("Teste de integração - Middleware de Autenticação", () => {
    it("Deve ser capaz de acessar a rota com token correto", async () => {
        const token = JWT.sign(
            {id: usuarioId},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )

        const resposta = await supertest(app)
        .get("/contas/meu-saldo")
        .set("Authorization", `Bearer ${token}`)

        expect(resposta.status).toBe(200)

        expect(resposta.body).toHaveProperty("saldo")
        expect(resposta.body).toHaveProperty("contaId")
        expect(resposta.body.saldo).toBe(200)
    })

    it("Não deve ser capaz de acessar a rota com um token inválido", async () => {
        const tokenInvalido = "meu-token-bem-errado"

        const resultado = await supertest(app)
        .get("/contas/meu-saldo").set("Authorization", `Bearer ${tokenInvalido}`)

        expect(resultado.body.message).toBe("Token inválido ou expirado")
        expect(resultado.status).toBe(401)
    })

    it("Não deve ser capaz de acessar a rota sem um token de acesso", async () => {
        const resultado = await supertest(app)
        .get("/contas/meu-saldo")

        expect(resultado.status).toBe(401)
        expect(resultado.body.message).toBe("Token não definido")
    })
})


afterAll(() => {
    db.close()
})
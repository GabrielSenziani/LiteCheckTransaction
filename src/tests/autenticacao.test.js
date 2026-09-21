import JWT from "jsonwebtoken";
import supertest from "supertest";
import app from "../app.js";
import db from "../database/database.js";

import { criaUsuario, criaConta } from "../helpers/criaUsuarioEContaSetup.js";

let usuarioId
let contaId


beforeEach(() => {
    db.exec("DELETE FROM Transacao")
    db.exec("DELETE FROM Conta")
    db.exec("DELETE FROM Usuario")

    usuarioId = criaUsuario(db, "userTest@email.com", "user123")
    contaId = criaConta(db, "User", 200, usuarioId)
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

        expect(resposta.body).toHaveProperty("contas")
        expect(resposta.body.contas.length).toBeGreaterThan(0)
        expect(resposta.body.contas[0].saldo).toBe(200)
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
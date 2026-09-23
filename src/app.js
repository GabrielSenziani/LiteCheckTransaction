import express from "express";

import "dotenv/config";

import transferenciaRouter from "./routes/transferenciaRoute.js";
import consultaRouter from "./routes/consultasRoute.js";
import extratoRouter from "./routes/consultaExtratosRoute.js"
import cadastroRouter from "./routes/cadastroRoute.js"
import loginRouter from "./routes/loginRoute.js"
import depositoRouter from "./routes/depositoRoute.js"
import criaContaRouter from "./routes/criaContaRoute.js"
import deletaRouter from "./routes/deletaDadosRoute.js"
import atualizaRouter from "./routes/atualizaDadosRoute.js"
import participacaoRouter from "./routes/participacoesRoute.js"

const app = express()


app.use(express.json());

app.use("/cadastro", cadastroRouter)
app.use("/login", loginRouter)
app.use("/transferir", transferenciaRouter)
app.use("/deposito", depositoRouter)
app.use("/cria-conta", criaContaRouter)
app.use("/contas", consultaRouter)
app.use("/consulta-extratos", extratoRouter)
app.use("/consulta-participacoes", participacaoRouter)
app.use("/deleta", deletaRouter)
app.use("/atualiza", atualizaRouter)

export default app;
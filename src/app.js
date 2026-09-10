import express from "express";
import "dotenv/config";
import transferenciaRouter from "./routes/transferenciaRoute.js";
import consultaRouter from "./routes/consultasRoute.js";
import cadastroRouter from "./routes/cadastroRoute.js"
import loginRouter from "./routes/loginRoute.js"
import depositoRouter from "./routes/depositoRoute.js"
import deletaRouter from "./routes/deletaDadosRoute.js"

const app = express()


app.use(express.json());

app.use("/cadastro", cadastroRouter)
app.use("/login", loginRouter)
app.use("/transferir", transferenciaRouter)
app.use("/deposito", depositoRouter)
app.use("/contas", consultaRouter)
app.use("/deleta", deletaRouter)

export default app;
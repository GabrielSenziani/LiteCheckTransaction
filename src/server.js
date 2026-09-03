import express from "express";
import "dotenv/config";
import transferenciaRouter from "../src/routes/transferenciaRoute.js";
import consultaRouter from "../src/routes/consultasRoute.js";
import cadastroRouter from "../src/routes/cadastroRoute.js"
import loginRouter from "../src/routes/loginRoute.js"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());

app.use("/cadastro", cadastroRouter)
app.use("/login", loginRouter)

app.use("/transferir", transferenciaRouter)

app.use("/contas", consultaRouter)

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
})
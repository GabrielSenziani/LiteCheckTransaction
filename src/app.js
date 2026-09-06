import express from "express";
import "dotenv/config";
import transferenciaRouter from "./routes/transferenciaRoute.js";
import consultaRouter from "./routes/consultasRoute.js";
import cadastroRouter from "./routes/cadastroRoute.js"
import loginRouter from "./routes/loginRoute.js"

const app = express()


app.use(express.json());

app.use("/cadastro", cadastroRouter)
app.use("/login", loginRouter)
app.use("/transferir", transferenciaRouter)
app.use("/contas", consultaRouter)

export default app;
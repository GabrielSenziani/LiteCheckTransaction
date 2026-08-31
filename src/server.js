import express from "express";
import "dotenv/config"
import transferenciaRouter from "../src/routes/transferenciaRoute.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json());

app.use("/transferir", transferenciaRouter)

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
})
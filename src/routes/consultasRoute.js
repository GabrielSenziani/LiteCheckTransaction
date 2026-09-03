import express from "express"
import { consulta } from "../controllers/consultasController.js"
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router();

router.get("/meu-saldo", autorizacao, consulta)

export default router;
import express from "express";

import { deletaTodosOsDados } from "../controllers/deletaDadosController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.delete("/meus-dados", autorizacao, deletaTodosOsDados)

export default router
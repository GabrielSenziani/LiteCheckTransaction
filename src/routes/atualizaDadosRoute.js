import express from "express";

import { atualizaDadosDoUsuario } from "../controllers/atualizaDadosController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.patch("/atualiza-dados/:idAlvo", autorizacao, atualizaDadosDoUsuario)

export default router
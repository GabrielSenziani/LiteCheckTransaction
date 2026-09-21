import express from "express";
import { consultaParticipacoesDasContas } from "../controllers/consultaParticipacoesController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.get("/", autorizacao, consultaParticipacoesDasContas)

export default router
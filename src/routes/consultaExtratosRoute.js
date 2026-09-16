import express from "express";
import { consultaDosExtratos } from "../controllers/consultaExtratosController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.get("/", autorizacao, consultaDosExtratos)

export default router;
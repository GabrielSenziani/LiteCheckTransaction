import express from "express";
import { transferir } from "../controllers/transferenciaController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.post("/", transferir, autorizacao)

export default router;
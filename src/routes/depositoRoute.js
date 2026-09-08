import express from "express";
import { deposito } from "../controllers/depositoController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.post("/", autorizacao, deposito)

export default router;
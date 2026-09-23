import express from "express";
import { criaNovaConta } from "../controllers/criaContaController.js";
import { autorizacao } from "../middlewares/auth.js";

const router = express.Router()

router.post("/", autorizacao, criaNovaConta)

export default router
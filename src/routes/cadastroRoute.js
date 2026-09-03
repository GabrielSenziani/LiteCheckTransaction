import express from "express";
import { cadastrar } from "../controllers/cadastroController.js";


const router = express.Router()

router.post("/", cadastrar)

export default router;
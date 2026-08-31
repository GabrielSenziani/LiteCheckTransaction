import express from "express"
import { consulta } from "../controllers/consultasController.js"

const router = express.Router();

router.get("/:id", consulta)

export default router;
import express from "express";
import { transferir } from "../controllers/transferenciaController.js";

const router = express.Router()

router.post("/", transferir)

export default router;
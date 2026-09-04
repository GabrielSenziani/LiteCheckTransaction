import { transferirDinheiro } from "../services/transferencia.js";
import db from "../database/database.js";

const ultimoId = db.prepare(`
    SELECT UsuarioId, ContaId, Saldo
    FROM Conta
    WHERE Titular = ?
    ORDER BY ContaId DESC
    LIMIT 1
    `)

const contaGabrel = ultimoId.get("Gabriel")
const contaCaetano = ultimoId.get("Caetano")

try {
    transferirDinheiro(db, contaGabrel.UsuarioId, contaCaetano.UsuarioId, 43124)

    console.log("Transferencia realizada com sucesso")
} catch (erro) {
    console.error("Transferencia negada:", erro.message)
}
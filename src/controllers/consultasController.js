import { buscaContaPorId } from "../services/consulta.js";
import db from "../database/database.js";

export const consulta = (req, res) => {
    try {
        const { id } = req.params

        const conta = buscaContaPorId(db, id)

        return res.status(200).json({
            contaId: conta.ContaId,
            saldo: conta.Saldo
        })
    } catch (erro) {
        const statusResponse = erro.status || 500

        return res.status(statusResponse).json({
            erro: erro.message || "Não foi possivel localizar o Usuário"
        })
    }
}
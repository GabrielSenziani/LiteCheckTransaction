import { buscaContaPorUsuarioId } from "../services/consulta.js";
import db from "../database/database.js";

export const consulta = (req, res) => {
    try {
        const id  = req.UsuarioId

        const contas = buscaContaPorUsuarioId(db, id)

        const contasFormatadas = contas.map(conta => ({
            contaId: conta.ContaId,
            saldo: conta.Saldo
        }))

        return res.status(200).json({
            contas: contasFormatadas
        })
    } catch (erro) {
        const statusResponse = erro.status || 500

        return res.status(statusResponse).json({
            erro: erro.message || "Não foi possivel localizar o Usuário"
        })
    }
}
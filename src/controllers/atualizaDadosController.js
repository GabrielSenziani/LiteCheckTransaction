import { atualizaDados } from "../services/atualizaDados.js";
import db from "../database/database.js";

export const atualizaDadosDoUsuario = (req, res) => {
    try {
        const id = req.UsuarioId
        const { idAlvo } = req.params
        const { email, senha } = req.body

        if (!id || !idAlvo) {
            return res.status(400).json({
                message: "Identificadores inválidos ou ausentes na requisição."
            })
        }

        atualizaDados(db, id, idAlvo, email, senha)

        return res.status(200).json({
            message: "Dados do Usuario atualizados com sucesso"
        })
    } catch (erro) {
        const statusResponse = erro.status || 500

        return res.status(statusResponse).json({
            erro: erro.message || "Não foi possivel atualizar os dados do Usuario"
        })
    }
}
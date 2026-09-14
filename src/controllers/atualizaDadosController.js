import { atualizaDados } from "../services/atualizaDados.js";
import db from "../database/database.js";

export const atualizaDadosDoUsuario = (req, res) => {
    try {
        const id = req.UsuarioId
        const { email, senha } = req.body

        if (!id) {
            return res.status(401).json({
                message: "Usuario não autenticado."
            })
        }

        atualizaDados(db, id, email, senha)

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
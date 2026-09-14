import { deletaDados } from "../services/deletaDados.js";
import db from "../database/database.js";

export const deletaTodosOsDados = (req, res) => {
    try {
        const id = req.UsuarioId

        if (!id) {
            return res.status(401).json({
                message: "Usuário não autenticado."
            })
        }

        deletaDados(db, id)

        return res.status(200).json({
        message: "Exclusão dos dados realizada com sucesso!"
    })

    } catch (erro) {
      const statusResponse = erro.status || 500

      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel deletar os dados do usuario"
      })
    }
}
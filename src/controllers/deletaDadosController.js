import { deletaDados } from "../services/deletaDados.js";
import db from "../database/database.js";

export const deletaTodosOsDados = (req, res) => {
    try {
        const id = req.UsuarioId
        const { idAlvo } = req.params

        if (!id || !idAlvo) {
            return res.status(400).json({
                message: "É necessário preencher com os dados obrigatórios (id, idAlvo)"
            })
        }

        deletaDados(db, id, idAlvo)

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
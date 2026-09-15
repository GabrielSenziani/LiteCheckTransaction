import db from "../database/database.js";
import { depositaDinheiro } from "../services/deposito.js";

export const deposito = (req, res) => {
    try {
    const idUsuario = req.UsuarioId
    const { contaIdAlvo ,valor } = req.body

    if (!contaIdAlvo || !valor) {
        return res.status(400).json({
         message: "O campo 'contaIdAlvo' e 'valor' são obrigatórios."
        })
    }

    depositaDinheiro(db, idUsuario, valor, contaIdAlvo)

    return res.status(200).json({
        message: "Depósito realizado com sucesso"
    })
    } catch (erro) {
      const statusResponse = erro.status || 500
      
      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel realizar o depósito"
      })
    }
}
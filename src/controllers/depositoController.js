import db from "../database/database.js";
import { depositaDinheiro } from "../services/deposito.js";

export const deposito = (req, res) => {
    try {
    const idOrigem = req.UsuarioId
    const { valor } = req.body

    if (!valor) {
        return res.status(400).json({
         message: "O campo 'valor' é obrigatório."
        })
    }

    depositaDinheiro(db, idOrigem, valor)

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
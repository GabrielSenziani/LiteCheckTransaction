import { transferirDinheiro } from "../services/transferencia.js";
import db from "../database/database.js"

export const transferir = (req, res) => {
    try {
        const { idOrigem, idDestino, valor } = req.body

        if(!idOrigem || !idDestino || !valor) {
          return res.status(400).json({
            message: "Faltam dados obrigatórios"
          })
        }

        transferirDinheiro(db, idOrigem, idDestino, valor)

        return res.status(200).json({
            message: "Transfêrencia realizada com sucesso!"
        })
    } catch (erro) {
      const statusResponse = erro.status || 500

      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel realizar a transferência"
      })
    }
}
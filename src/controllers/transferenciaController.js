import { transferirDinheiro } from "../services/transferencia.js";
import db from "../database/database.js";

export const transferir = (req, res) => {
    try {
        const { idOrigem, idDestino, valor } = req.body

        transferirDinheiro(idOrigem, idDestino, valor)

        return res.status(200).json({
            message: "Transfêrencia realizada com sucesso!"
        })
    } catch (erro) {
      return res.status(400).json({
        erro: erro.message || "Não foi possivel realizar a transferência"
      })
    }
}
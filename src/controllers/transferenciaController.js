import { transferirDinheiro } from "../services/transferencia.js";
import { buscaContaPorId } from "../services/consulta.js";
import db from "../database/database.js"

export const transferir = (req, res) => {
    try {
        const idOrigem = req.UsuarioId
        const { idDestino, valor } = req.body

        if(!idDestino || !valor) {
          return res.status(400).json({
            message: "Faltam dados obrigatórios"
          })
        }

        const contaRemetente = db.prepare(`
          SELECT ContaId
          FROM Conta
          WHERE UsuarioId = ?
          `).get(idOrigem)

          if (!contaRemetente) {
           return res.status(404).json({ 
            erro: "Sua conta de origem não foi encontrada." 
          })
        }


        const idOrigemConta = contaRemetente.ContaId;

        const contaDestinoValida = db.prepare(`
          SELECT ContaId FROM Conta WHERE ContaId = ?
        `).get(idDestino);

        if (!contaDestinoValida) {
            return res.status(404).json({ 
                erro: `A conta de destino (ContaId: ${idDestino}) não existe.` 
            });
        }

        transferirDinheiro(db, idOrigemConta, idDestino, valor)

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
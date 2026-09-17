import { consultaExtratos } from "../services/consultaExtratos.js";
import db from "../database/database.js";

export const consultaDosExtratos = (req, res) => {
    try {
     const idUsuarioLogado = req.UsuarioId

     if(!idUsuarioLogado) {
        return res.status(401).json({
            message: "Usuário não autenticado"
        })
     }
     
     const extratos = consultaExtratos(db, idUsuarioLogado)

     const extratosFormatados = extratos.map(extrato => ({
      transacaoId: extrato.TransacaoId,
      tipo: extrato.Tipo,
      valor: extrato.Valor,
      contaOrigem: extrato.ContaOrigemId,
      titularDaContaOrigem: extrato.TitularOrigem,
      contaDestinoId: extrato.ContaDestinoId,
      titularDaContaDestino: extrato.TitularDestino
     }))

     return res.status(200).json({
      extratos: extratosFormatados
     })

    } catch (erro) {
      const statusResponse = erro.status || 500
      
      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel consultar os extratos das contas"
      })
    }
}
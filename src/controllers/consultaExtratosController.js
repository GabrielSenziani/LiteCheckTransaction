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

     return res.status(200).json(extratos)

    } catch (erro) {
      const statusResponse = erro.status || 500
      
      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel consultar os extratos das contas"
      })
    }
}
import { criaContaDoUsuario } from "../services/criaConta.js";
import db from "../database/database.js";

export const criaNovaConta = (req, res) => {
    try {
      const idUsuario = req.UsuarioId
      const { titular } = req.body
      
      if (!idUsuario) {
        return res.status(401).json({
            message: "Usuário não autenticado."
        })
      }

      const contaCriada = criaContaDoUsuario(db, idUsuario, titular)

      return res.status(201).json({
        message: "Conta criada com sucesso",
        idDaConta: contaCriada
      })
     } catch (erro) {
      const statusResponse = erro.status || 500
      return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel criar a conta"
      })
    }
}
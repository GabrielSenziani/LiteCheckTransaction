import { cadastraUsuario } from "../services/usuarioService.js";
import db from "../database/database.js";

export const cadastrar = (req, res) => {
    try {
      const { email, senha } = req.body

      const novoUsuarioId = cadastraUsuario(db, email, senha)

    return res.status(201).json({
        message: "Usuario cadastrado com sucesso",
        usuarioId: novoUsuarioId
    })
  } catch (erro) {
    const statusResponse = erro.status || 500

    return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel realizar o cadastro"
    })
  }
}
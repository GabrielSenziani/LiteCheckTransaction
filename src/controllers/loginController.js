import { logaUsuario } from "../services/usuarioService.js";
import db from "../database/database.js";

export const login = (req, res) => {
    try {
        const { email, senha } = req.body

        const realizaLogin = logaUsuario(db, email, senha)

        return res.status(200).json({
            message: "Login realizado com sucesso",
            token: realizaLogin.token
        })
    } catch (erro) {
        const statusResponse = erro.status || 500

        return res.status(statusResponse).json({
            erro: erro.message || "Não foi possivel realizar o login"
        })
    }
}
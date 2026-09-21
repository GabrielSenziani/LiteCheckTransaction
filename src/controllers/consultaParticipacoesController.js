import { consultaParticipacoes } from "../services/consultaExtratos.js";
import db from "../database/database.js";

export const consultaParticipacoesDasContas = (req, res) => {
    try {
        const idUsuario = req.UsuarioId

        if (!idUsuario) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            })
        }

        const consultas = consultaParticipacoes(db, idUsuario)

        const consultaFormatada = consultas.map(consulta => ({
            idDaConta: consulta.ContaId,
            totalDeParticipações: consulta.TotalDeParticipações
        }))

        return res.status(200).json({
            consultas: consultaFormatada
        })

    } catch (erro) {
       const statusResponse = erro.status || 500
       return res.status(statusResponse).json({
        erro: erro.message || "Não foi possivel consultar as participações das contas vinculadas ao usuário"
       })
    }
}
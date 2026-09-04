import JWT from "jsonwebtoken";

export function autorizacao (req, res, next) {
    const pegaToken = req.headers.authorization

    if(pegaToken === undefined) {
        return res.status(401).json({
            message: "Token não definido"
        })
    }

    const separaPartes = pegaToken.split(" ")
    const token = separaPartes[1]

    try {
      const verificaToken = JWT.verify(token, process.env.JWT_SECRET)
      
      req.UsuarioId = verificaToken.id

      return next()
    } catch (erro) {
        return res.status(401).json({
            message: "Token inválido ou expirado"
        })
     }
}
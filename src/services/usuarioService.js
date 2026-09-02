import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const cadastraUsuario = (db, email, senha) => {

   if (!email || !senha) {
    const erro = new Error ("É necessário preencher os campos Email e senha")
    erro.status = 400
    throw erro
   }

   if (!emailRegex.test(email)) {
    const erro = new Error ("Formato do email inválido")
    erro.status = 400
    throw erro
   }

   if (senha.length < 6) {
    const erro = new Error ("É necessário que a senha tenha pelo menos 6 digitos")
    erro.status = 400
    throw erro
   }

   const usuarioExistente = db.prepare(`
    SELECT UsuarioId, Email
    FROM Usuario
    WHERE Email = ?
    `).get(email)

    if (usuarioExistente) {
        const erro = new Error("Email já em uso")
        erro.status = 409
        throw erro
    }

  const senhaCriptografada = bcrypt.hashSync(senha, 10)

    const resultado = db.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `).run(email, senhaCriptografada)

        return resultado.lastInsertRowid
}

export const logaUsuario= (db, email, senha) => {
  if (!email || !senha) {
    const erro = new Error ("É necessário preencher os campos Email e senha")
    erro.status = 400
    throw erro
   }

  if (!emailRegex.test(email)) {
    const erro = new Error ("Formato do email inválido")
    erro.status = 401
    throw erro
   }

   const usuario = db.prepare(`
    SELECT UsuarioId, Email, Senha
    FROM Usuario
    WHERE Email = ?
    `).get(email)

    if(!usuario) {
        const erro = new Error("E-mail ou senha incorretos")
        erro.status = 401
        throw erro
    }

    const senhaCorreta = bcrypt.compareSync(senha, usuario.Senha)

    if(!senhaCorreta) {
        const erro = new Error("E-mail ou senha incorretos")
        erro.status = 401
        throw erro
    }

    const geraToken = JWT.sign(
        {id: usuario.UsuarioId},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    return {
        usuarioId: usuario.UsuarioId,
        email: usuario.Email,
        token: geraToken
    }
}
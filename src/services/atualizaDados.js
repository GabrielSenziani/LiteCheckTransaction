 import bcrypt from "bcrypt";
 import { buscaContaPorId } from "./consulta.js";

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const atualizaDados = (db, id, idAlvo ,email, senha) => {

    const dadosParaAtualizar = idAlvo || id
    const contaAlvo = buscaContaPorId(db, dadosParaAtualizar)

    if (contaAlvo.UsuarioId !== id) {
      const erro = new Error("Você não tem permissão para atualizar os dados desta conta")
      erro.status = 403 
      throw erro
    }
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

    if (usuarioExistente  && usuarioExistente.UsuarioId !== contaAlvo.UsuarioId) {
        const erro = new Error("Email já em uso")
        erro.status = 409
        throw erro
    }

    const senhaCriptografada = bcrypt.hashSync(senha, 10)
    

        db.prepare(`
            UPDATE Usuario
            SET Email = ?, Senha = ?
            WHERE UsuarioId = ?
            `).run(email, senhaCriptografada, contaAlvo.UsuarioId)

    return contaAlvo.UsuarioId
}
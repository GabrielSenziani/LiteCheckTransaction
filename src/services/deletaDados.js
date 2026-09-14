import { buscaContaPorUsuarioId } from "./consulta.js";

export const deletaDados = (db, id) => {

    const contaAlvo = buscaContaPorUsuarioId(db, id)

    const deletaTransacoesOrigem = db.prepare(`
        DELETE FROM Transacao 
        WHERE ContaOrigemId = ?
        `);
    
    const deletaTransacoesDestino = db.prepare(`
        DELETE FROM Transacao 
        WHERE ContaDestinoId = ?
        `);

    const deletaConta = db.prepare(`
        DELETE FROM Conta
        WHERE ContaId = ?
        `)

    const deletaUsuario = db.prepare(`
        DELETE FROM Usuario
        WHERE UsuarioId = ?
        `)

    const executaExclusão = db.transaction((uId, cId) => {
        deletaTransacoesOrigem.run(cId)
        deletaTransacoesDestino.run(cId)
        deletaConta.run(cId)
        deletaUsuario.run(uId)
    })

    try {
     executaExclusão(contaAlvo.UsuarioId, contaAlvo.ContaId)

     return contaAlvo.ContaId
    } catch (error) {
      const erro = new Error("Não foi possivel realizar a exclusão dos dados: " + error.message)
      erro.status = 500
      throw erro
    }
}
import { buscaContaPorId } from "./consulta.js";

export const deletaDados = (db, id, idAlvo) => {
    const dadosParaApagar = idAlvo || id

    const contaAlvo = buscaContaPorId(db, dadosParaApagar)

     if (contaAlvo.UsuarioId !== id) {
        const erro = new Error("Você não tem permissão para excluir os dados desta conta")
        erro.status = 403 
        throw erro
    }

    const usuarioId = contaAlvo.UsuarioId;

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
        deletaTransacoesOrigem.run(uId)
        deletaTransacoesDestino.run(uId)
        deletaConta.run(cId)
        deletaUsuario.run(uId)
    })

    try {
     executaExclusão(usuarioId, dadosParaApagar)

     return dadosParaApagar
    } catch (error) {
      const erro = new Error("Não foi possivel realizar a exclusão dos dados: " + error.message)
      erro.status = 500
      throw erro
    }
}
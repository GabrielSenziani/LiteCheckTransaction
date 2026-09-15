import { buscaContaPorUsuarioId } from "./consulta.js";

export const deletaUsuario = (db, idUsuario) => {
  const contas = buscaContaPorUsuarioId(db, idUsuario)
  const verificaSaldo = contas.some(conta => conta.Saldo > 0)

  if (verificaSaldo) {
    const erro = new Error("A conta não pode ser excluida pois possui saldo")
    erro.status = 400
    throw erro
  }

  const deletaTransacoesOrigem = db.prepare(`
    DELETE FROM Transacao 
    WHERE ContaOrigemId = ?
    `)
  
  const deletaTransacoesDestino = db.prepare(`
    DELETE FROM Transacao 
    WHERE ContaDestinoId = ?
    `)
  
  const deletaConta = db.prepare(`
    DELETE FROM Conta 
    WHERE ContaId = ?
    `)
  
  const queryDeletaUsuario = db.prepare(`
    DELETE FROM Usuario 
    WHERE UsuarioId = ?
    `)

  const executaExclusao = db.transaction((listaContas, uId) => {
    for (const conta of listaContas) {
      deletaTransacoesOrigem.run(conta.ContaId)
      deletaTransacoesDestino.run(conta.ContaId)
      deletaConta.run(conta.ContaId)
    }
    
    queryDeletaUsuario.run(uId)
  })

  try {
    executaExclusao(contas, idUsuario)
    return idUsuario
  } catch (error) {
    const erro = new Error("Não foi possivel realizar a exclusão dos dados")
    erro.status = 500
    throw erro
  }
}
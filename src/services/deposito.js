import { buscaContaPorUsuarioId } from "./consulta.js"

export const depositaDinheiro = (db, idUsuario, valor, contaIdAlvo) => {

 const escolheTipoDeDeposito = db.transaction((idUsuario, valor, contaIdAlvo) => {
  
 const valorNumerico = Number(valor)

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        const erro = new Error("O valor para realizar o depósito precisa ser maior que 0")
        erro.status = 400
        throw erro
    }

 const contasDoUsuario = buscaContaPorUsuarioId(db, idUsuario)
 const contaEncontrada = contasDoUsuario.find(conta => conta.ContaId === Number(contaIdAlvo))

   if(!contaEncontrada) {
    const erro = new Error("A conta não foi encontrada ou você não possui permissão para depositar nesta conta.")
    erro.status = 403
    throw erro
 }

    db.prepare(`
    UPDATE Conta
    SET Saldo = Saldo + ?
    WHERE ContaId = ?
    `).run(valorNumerico, contaEncontrada.ContaId)

    db.prepare(`
    INSERT INTO Transacao (Tipo, Valor, ContaOrigemId, ContaDestinoId)
    VALUES ('Deposito', ?, NULL, ?)
    `).run(valorNumerico, contaEncontrada.ContaId)


  return true
 })

  return escolheTipoDeDeposito.immediate(idUsuario, valor, contaIdAlvo)
}
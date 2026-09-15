import { buscaContaPorUsuarioId } from "./consulta.js"
import { buscaContaPorId } from "./consulta.js"

export const transferirDinheiro = (db, idUsuario, contaIdOrigem, idDestino, valor) => {
        const escolheTransferencia = db.transaction((idUsuario, contaIdOrigem, idDestino, valor) => {
        
        const valorNumerico = Number(valor)

        if(isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar a transferência precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

        const contaOrigem = buscaContaPorUsuarioId(db, idUsuario);
        const contaEncontrada = contaOrigem.find(conta => conta.ContaId === Number(contaIdOrigem))

        if(!contaEncontrada) {
      const erro = new Error("A conta não foi encontrada ou você não possui permissão para realizar uma transferencia apartir desta conta")
      erro.status = 403
      throw erro;
       }
        

        const contaDestino = buscaContaPorId(db, idDestino);


         if (Number(contaIdOrigem) === Number(idDestino)) {
        const erro = new Error("Não é possível realizar uma transferência para a sua própria conta.")
        erro.status = 400;
        throw erro;
      }

    const resultadoDaConta = db.prepare(`
        UPDATE Conta
        SET Saldo = Saldo - ?
        WHERE ContaId = ?
        AND Saldo >= ?
        `).run(valorNumerico, contaEncontrada.ContaId, valorNumerico)

    if (resultadoDaConta.changes === 0) {
     const erro = new Error("Saldo insuficiente!")
     erro.status = 422
     throw erro
    }

    db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, contaDestino.ContaId)

    db.prepare(`
        INSERT INTO Transacao (Tipo, Valor, ContaOrigemId, ContaDestinoId)
        VALUES ('Transferencia', ?, ?, ?)
        `).run(valorNumerico, contaEncontrada.ContaId, contaDestino.ContaId)

  return true
})

  return escolheTransferencia.immediate(idUsuario, contaIdOrigem, idDestino, valor)
}
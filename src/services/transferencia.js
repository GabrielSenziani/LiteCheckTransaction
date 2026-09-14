import { buscaContaPorUsuarioId } from "./consulta.js"
import { buscaContaPorId } from "./consulta.js"

export const transferirDinheiro = (db, idOrigem, idDestino, valor) => {
        const escolheTransferencia = db.transaction((idOrigem, idDestino, valor) => {
        
        const valorNumerico = Number(valor)

        if(isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar a transferência precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

        const contaOrigem = buscaContaPorUsuarioId(db, idOrigem);
        const idOrigemConta = contaOrigem.ContaId

        const contaDestino = buscaContaPorId(db, idDestino);
        const idDestinoConta = contaDestino .ContaId

         if (idOrigemConta === idDestinoConta) {
        const erro = new Error("Não é possível realizar uma transferência para a sua própria conta.")
        erro.status = 400;
        throw erro;
    }

    const resultadoDaConta = db.prepare(`
        UPDATE Conta
        SET Saldo = Saldo - ?
        WHERE ContaId = ?
        AND Saldo >= ?
        `).run(valorNumerico, idOrigemConta, valorNumerico)

    if (resultadoDaConta.changes === 0) {
     const erro = new Error("Saldo insuficiente!")
     erro.status = 422
     throw erro
    }

    db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, idDestinoConta)

    db.prepare(`
        INSERT INTO Transacao (Tipo, Valor, ContaOrigemId, ContaDestinoId)
        VALUES ('Transferencia', ?, ?, ?)
        `).run(valorNumerico, idOrigemConta, idDestinoConta)

    

    return true
  })

  return escolheTransferencia.immediate(idOrigem, idDestino, valor)
}
import { buscaContaPorId } from "./consulta.js"

export const transferirDinheiro = (db, idOrigem, idDestino, valor) => {
        const escolheTransferencia = db.transaction((idOrigem, idDestino, valor) => {
        
        const valorNumerico = Number(valor)

        if(isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar a transferência precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

         if (idOrigem === idDestino) {
            const erro = new Error("Não é possível realizar uma transferência para a sua própria conta.")
            erro.status = 400;
            throw erro;
        }

        buscaContaPorId(db, idOrigem)
        buscaContaPorId(db, idDestino);

    const resultadoDaConta = db.prepare(`
        UPDATE Conta
        SET Saldo = Saldo - ?
        WHERE ContaId = ?
        AND Saldo >= ?
        `).run(valorNumerico, idOrigem, valorNumerico)

    if (resultadoDaConta.changes === 0) {
     const erro = new Error("Saldo insuficiente!")
     erro.status = 422
     throw erro
    }

    db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, idDestino)

    db.prepare(`
        INSERT INTO Transacao (Tipo, Valor, ContaOrigemId, ContaDestinoId)
        VALUES ('Transferencia', ?, ?, ?)
        `).run(valorNumerico, idOrigem, idDestino)

    

    return true
  })

  return escolheTransferencia.immediate(idOrigem, idDestino, valor)
}
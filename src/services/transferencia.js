export const transferirDinheiro = (db, idOrigem, idDestino, valor) => {
        const escolheTransferencia = db.transaction((idOrigem, idDestino, valor) => {
        
        const verificaIdOrigem = Number(idOrigem)
        const verificaIdDestino = Number(idDestino)

        if (isNaN(verificaIdOrigem) || verificaIdOrigem <= 0 || isNaN(verificaIdDestino) || verificaIdDestino <= 0) {
            const erro = new Error("id inválido")
            erro.status = 400
            throw erro
        }
        
        const valorNumerico = Number(valor)

        if(isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar a transferência precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

        const conta = db.prepare(`
        SELECT Saldo
        FROM Conta 
        WHERE ContaId = ?
        `).get(verificaIdOrigem)

    if (!conta) {
        const erro = new Error("O id da conta não existe")
        erro.status = 404
        throw erro
    }

    const resultadoDaConta = db.prepare(`
        UPDATE Conta
        SET Saldo = Saldo - ?
        WHERE ContaId = ?
        AND Saldo >= ?
        `).run(valorNumerico, verificaIdOrigem, valorNumerico)

    if (resultadoDaConta.changes === 0) {
     const erro = new Error("Saldo insuficiente!")
     erro.status = 422
     throw erro
    }

   const resultadoDestino = db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, verificaIdDestino)

    if(resultadoDestino.changes === 0) {
        const erro = new Error("O id do Destinatário não existe!")
        erro.status = 404
        throw erro
    }

    return true
  })

  return escolheTransferencia.immediate(idOrigem, idDestino, valor)
}
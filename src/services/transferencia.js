export const transferirDinheiro = (db, idOrigem, idDestino, valor) => {
        const escolheTransferencia = db.transaction((idOrigem, idDestino, valor) => {
        
        const verificaIdOrigem = Number(idOrigem)
        const verificaIdDestino = Number(idDestino)

        if (isNaN(verificaIdOrigem) || verificaIdOrigem <= 0 || isNaN(verificaIdDestino) || verificaIdDestino <= 0) {
            throw new Error("id inválido")
        }
        
        const valorNumerico = Number(valor)

        if(isNaN(valorNumerico) || valorNumerico <= 0) {
            throw new Error("O valor para realizar a transferência precisa ser maior que 0")
        }

        const conta = db.prepare(`
        SELECT Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(verificaIdOrigem)

    if (!conta) {
        throw new Error("O id da conta não existe")
    }

    const resultadoDaConta = db.prepare(`
        UPDATE Conta
        SET Saldo = Saldo - ?
        WHERE ContaId = ?
        AND Saldo >= ?
        `).run(valorNumerico, verificaIdOrigem, valorNumerico)

    if (resultadoDaConta.changes === 0) {
     throw new Error("Saldo insuficiente!")
    }

   const resultadoDestino = db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, verificaIdDestino)

    if(resultadoDestino.changes === 0) {
        throw new Error("O id do Destinatário não existe ou é inválido!")
    }

    return true
  })

  return escolheTransferencia(idOrigem, idDestino, valor)
}
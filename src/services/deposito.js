import { buscaContaPorUsuarioId } from "./consulta.js";

export const depositaDinheiro = (db, idOrigem, valor) => {
    const escolheTipoDeDeposito = db.transaction((idOrigem, valor) => {
        
        const valorNumerico = Number(valor)

        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar o depósito precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

        const contaAlvo = buscaContaPorUsuarioId(db, idOrigem);

        db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE ContaId = ?
        `).run(valorNumerico, contaAlvo.ContaId)

        db.prepare(`
          INSERT INTO Transacao (Tipo, Valor, ContaOrigemId, ContaDestinoId)
          VALUES ('Deposito', ?, NULL, ?)
        `).run(valorNumerico, contaAlvo.ContaId)

        return true
    })

    return escolheTipoDeDeposito.immediate(idOrigem, valor)
}
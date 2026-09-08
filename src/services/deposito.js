import { buscaContaPorId } from "./consulta.js";

export const depositaDinheiro = (db, idOrigem, valor, idContaAlvo) => {
    const escolheTipoDeDeposito = db.transaction((idOrigem, valor, idContaAlvo) => {
        
        const valorNumerico = Number(valor)

        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            const erro = new Error("O valor para realizar o depósito precisa ser maior que 0")
            erro.status = 400
            throw erro
        }

        const contaParaDepositar = idContaAlvo || idOrigem

        const contaAlvo = buscaContaPorId(db, contaParaDepositar);

       if (contaAlvo.UsuarioId !== idOrigem) {
            const erro = new Error("Você não tem permissão para depositar nesta conta")
            erro.status = 403 
            throw erro
        }

        db.prepare(`
         UPDATE Conta 
         SET Saldo = Saldo + ? 
         WHERE UsuarioId = ?
        `).run(valorNumerico, contaParaDepositar)

        return true
    })

    return escolheTipoDeDeposito.immediate(idOrigem, valor, idContaAlvo)
}
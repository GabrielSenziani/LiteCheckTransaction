export const buscaContaPorId = (db, id) => {
    const verificaFormatoDoId = Number(id)

    if (isNaN(verificaFormatoDoId) || verificaFormatoDoId <= 0) {
        const erro = new Error("Formato do id inválido")
        erro.status = 400
        throw erro
    }

    const conta = db.prepare(`
        SELECT ContaId, Saldo
        FROM Conta
        WHERE ContaId = ?
        `).get(verificaFormatoDoId)

    if (!conta) {
        const erro = new Error("O id da conta não existe")
        erro.status = 404
        throw erro
    }
    return conta
}
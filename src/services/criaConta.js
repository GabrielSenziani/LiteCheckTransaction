export const criaContaDoUsuario = (db, idUsuario, titular) => {
    if (titular === null || titular === undefined) {
        const erro = new Error("Valores vazios não são permitidos")
        erro.status = 400
        throw erro
    }

    if(typeof titular !== 'string') {
        const erro = new Error("Valores inválidos não são permitidos")
        erro.status = 400
        throw erro
    }

    if (titular.trim() === "" || titular.length <= 2) {
        const erro = new Error("É necessário que o nome da conta tenha pelo menos 3 caracteres e que não haja espaços em branco ou separação desnecessária")
        erro.status = 400
        throw erro
    } 

    const novaConta = db.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `).run(titular, 0, idUsuario)

    return novaConta.lastInsertRowid
}
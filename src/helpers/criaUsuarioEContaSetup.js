export const criaUsuario = (db, email, senha) => {
    const criaUsuarios = db.prepare(`
        INSERT INTO Usuario (Email, Senha)
        VALUES (?, ?)
        `)

    const usuario = criaUsuarios.run(email, senha)

    return usuario.lastInsertRowid
}

export const criaConta = (db, titular, saldo, usuarioId) => {
    const criaContas = db.prepare(`
        INSERT INTO Conta (Titular, Saldo, UsuarioId)
        VALUES (?, ?, ?)
        `)

    const conta = criaContas.run(titular, saldo, usuarioId)

    return conta.lastInsertRowid
}
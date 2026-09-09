export const inicializaTabelas = (db) => {
    db.pragma("foreign_keys = ON");

    db.exec(`
        CREATE TABLE IF NOT EXISTS Usuario(
            UsuarioId INTEGER PRIMARY KEY AUTOINCREMENT,
            Email TEXT NOT NULL UNIQUE,
            Senha TEXT NOT NULL 
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS Conta (
            ContaId INTEGER PRIMARY KEY AUTOINCREMENT,
            Titular TEXT NOT NULL,
            Saldo NUMERIC NOT NULL CHECK (Saldo >= 0),
            UsuarioId INTEGER NOT NULL,
            FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS Transacao (
            TransacaoId INTEGER PRIMARY KEY AUTOINCREMENT,
            Tipo TEXT NOT NULL CHECK (Tipo IN ('Deposito', 'Transacao')),
            Valor NUMERIC NOT NULL CHECK (Valor > 0),
            ContaOrigemId INTEGER,
            ContaDestinoId INTEGER NOT NULL,
            DataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ContaOrigemId) REFERENCES Usuario(UsuarioId),
            FOREIGN KEY (ContaDestinoId) REFERENCES Usuario(UsuarioId)
        );
    `);
};
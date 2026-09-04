import Database from "better-sqlite3";

const nomeBanco = process.env.NODE_ENV === 'test' 
    ? "src/database/sqlite.test.db" 
    : "src/database/sqlite.db";

const db = new Database(nomeBanco);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS Usuario(
    UsuarioId INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    Senha TEXT NOT NULL 
    )
    `)

db.exec(`
    CREATE TABLE IF NOT EXISTS Conta (
    ContaId INTEGER PRIMARY KEY AUTOINCREMENT,
    Titular TEXT NOT NULL,
    Saldo NUMERIC NOT NULL CHECK (Saldo >= 0),
    UsuarioId INTEGER NOT NULL,
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
    );
 `);

 export default db
import Database from "better-sqlite3";

const db = new Database("src/database/sqlite.db");

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS Conta (
    ContaId INTEGER PRIMARY KEY AUTOINCREMENT,
    Titular TEXT NOT NULL,
    Saldo NUMERIC NOT NULL CHECK (Saldo >= 0)
    );
 `);

 export default db
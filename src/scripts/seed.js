import db from "../database/database.js";

db.exec(`
    DELETE FROM CONTA
    `)

const contaTesteUm = db.prepare(`
    INSERT INTO Conta (Titular, Saldo)
    VALUES (?, ?)
    `).run("Gabriel", 50000).lastInsertRowid

console.log(contaTesteUm)

const contaTesteDois = db.prepare(`
    INSERT INTO Conta (Titular, Saldo)
    VALUES (?, ?)
    `).run("Maria", 750).lastInsertRowid

console.log(contaTesteDois)

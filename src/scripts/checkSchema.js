import db from "../database/database.js";

const definicao = db.prepare(`
    SELECT sql 
    FROM sqlite_master 
    WHERE name = 'Conta'
`).get();
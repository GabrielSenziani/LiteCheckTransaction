import db from "../database/database.js";
import bcrypt from "bcrypt";

db.exec(`
    DELETE FROM Conta;
    DELETE FROM Usuario;
    `)

const senhaCriptografada = bcrypt.hashSync("minhaSenha123", 10)
const senhaCriptografadaDois = bcrypt.hashSync("4442", 10)

const criaUsuarioUm = db.prepare(`
    INSERT INTO Usuario (Email, Senha)
    VALUES (?, ?)
    `).run("gabriel@email.com", senhaCriptografada)

const usuarioId = criaUsuarioUm.lastInsertRowid

const criaUsuarioDois = db.prepare(`
    INSERT INTO Usuario (Email, Senha)
    VALUES (?, ?)
    `).run("Caetas123@email.com", senhaCriptografadaDois)

const usuarioIdDois = criaUsuarioDois.lastInsertRowid

const contaTesteUm = db.prepare(`
    INSERT INTO Conta (Titular, Saldo, UsuarioId)
    VALUES (?, ?, ?)
    `).run("Gabriel", 50000, usuarioId).lastInsertRowid

console.log(contaTesteUm)

const contaTesteDois = db.prepare(`
    INSERT INTO Conta (Titular, Saldo, UsuarioId)
    VALUES (?, ?, ?)
    `).run("Caetano", 750, usuarioIdDois).lastInsertRowid

console.log(contaTesteDois)

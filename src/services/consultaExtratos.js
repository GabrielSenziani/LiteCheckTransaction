export const consultaExtratos = (db, idUsuario) => {
    const query = db.prepare(`
    SELECT TransacaoId, Tipo, Valor, ContaOrigemId, ContaDestinoId, ContaOrigem.Titular AS TitularOrigem, ContaDestino.Titular AS TitularDestino
    FROM Transacao
    LEFT JOIN Conta ContaOrigem ON ContaOrigem.ContaId = Transacao.ContaOrigemId
    LEFT JOIN Conta ContaDestino ON ContaDestino.ContaId = Transacao.ContaDestinoId
    WHERE ContaOrigem.UsuarioId = ? OR ContaDestino.UsuarioId = ?
    ORDER BY TransacaoId
    `)

  return query.all(idUsuario, idUsuario);
}
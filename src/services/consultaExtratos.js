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

export const consultaParticipacoes = (db, idUsuario) => {

  const query = db.prepare(`
    SELECT TabelaDeParticipação.ContaId, COUNT(*) AS TotalDeParticipações
    FROM (
    SELECT ContaOrigemId AS ContaId
    FROM Transacao
    WHERE ContaOrigemId IS NOT NULL 
    UNION ALL
    SELECT ContaDestinoId as ContaId
    FROM Transacao
    ) AS TabelaDeParticipação

    INNER JOIN Conta c ON c.ContaId = TabelaDeParticipação.ContaId
    WHERE c.UsuarioId = ?

    GROUP BY TabelaDeParticipação.ContaId
    `)

    return query.all(idUsuario)
}
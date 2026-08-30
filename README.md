# ContaApi - Sistema de Transferências Bancárias (EM PRODUÇÃO)

Uma API REST desenvolvida em Node.js para gerenciamento e transferência de saldo entre contas bancárias. O projeto utiliza better-sqlite3 com suporte a transações ACID e conta com uma arquitetura de testes automatizados totalmente isolada utilizando Jest.

## Tecnologias Utilizadas

- Node.js (Ambiente de execução com ES Modules)
- Express v5 (Framework Web)
- better-sqlite3 (Banco de dados SQLite rápido e síncrono)
- Jest (Framework de testes automatizados)
- Supertest (Testes de integração HTTP)
- Nodemon (Ferramenta de desenvolvimento para auto-reload)

## Estrutura do Projeto

```text
ContaApi/
├── src/
│   ├── controllers/
│   │   └── transferenciaController.js  
│   ├── database/
│   │   ├── database.js                 
│   │   ├── sqlite.db                   
│   │   └── sqlite.test.db              
│   ├── scripts/
│   │   ├── checkSchema.js             
│   │   └── seed.js                     
│   ├── services/
│   │   └── transferencia.js            
│   ├── tests/
│   │   └── transferencia.test.js      
│   └── server.js                       
├── .gitignore
├── package.json
└── README.md
```

## Regras de Negócio (transferirDinheiro)

A função principal do sistema garante consistência total usando Transações (db.transaction). Se qualquer etapa falhar, toda a operação é revertida de forma automática e segura.

### Validações inclusas:
1. IDs de Contas: Devem ser números válidos maiores que zero.
2. Valor da Transferência: Deve ser um número maior que zero.
3. Existência da Conta: Verifica se a conta de origem existe no banco de dados.
4. Saldo Suficiente: Restringe a operação caso a conta de origem não tenha fundos necessários.
5. Existência do Destinatário: Garante que o dinheiro só sairá da conta de origem se a de destino receber o valor com sucesso.

## Estrutura de Testes Isolada

Para evitar que os testes corrompam ou poluam os dados originais do banco de dados (sqlite.db), foi configurado um ecossistema isolado que aponta as operações de teste para o arquivo sqlite.test.db.

### Ciclo de vida dos testes (transferencia.test.js):
- beforeAll: Ativa o suporte a chaves estrangeiras e recria a tabela Conta do zero no banco de testes.
- beforeEach: Limpa os dados antigos da tabela (DELETE FROM Conta) e reinicia os dados fictícios padrão antes de cada cenário de teste.
- afterAll: Encerra a conexão com o banco de testes de forma segura.

---

## Como Executar o Projeto

Instale as dependências do projeto:
```bash
npm install
```

### 1. Executar os Testes Automatizados (Jest)
Roda a suíte de testes passando o suporte experimental a ES Modules do Node.js:
```bash
npm test
```

### 2. Iniciar em Ambiente de Desenvolvimento (Nodemon)
O servidor reiniciará automaticamente a cada modificação nos arquivos:
```bash
npm run dev
```

### 3. Iniciar em Produção
```bash
npm start
```

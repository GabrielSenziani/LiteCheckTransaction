# ContaApi

API REST desenvolvida com Node.js e Express para simular operações de um sistema de contas, com foco no estudo prático de **SQLite, SQL, relacionamentos entre tabelas, transações, autenticação e testes automatizados**.

O projeto foi desenvolvido como uma aplicação prática para consolidar conceitos de desenvolvimento backend e banco de dados relacional, aplicando regras de negócio em operações como cadastro de usuários, criação de contas, depósitos, transferências e consulta de extratos.

## Tecnologias

- Node.js
- Express
- SQLite
- better-sqlite3
- JWT
- Jest
- Supertest
- Docker
- Git
- GitHub Actions

---

## Funcionalidades

### Usuários

- Cadastro de usuários
- Login
- Autenticação utilizando JWT
- Proteção de rotas através de middleware
- Associação das operações ao usuário autenticado
- Atualização de dados
- Exclusão de dados

### Contas

- Criação de novas contas
- Associação de contas ao usuário autenticado
- Controle de saldo
- Identificação do titular da conta

### Operações financeiras

- Depósitos
- Transferências entre contas
- Validação de saldo disponível
- Atualização do saldo da conta de origem
- Atualização do saldo da conta de destino
- Registro das transações

### Consultas

- Consulta de contas
- Consulta de participações
- Consulta de extratos
- Identificação das contas de origem e destino nas transações
- Restrição das consultas de acordo com o usuário autenticado

---

## Arquitetura

O projeto foi organizado em camadas, separando responsabilidades entre **rotas, controllers, services, middlewares e banco de dados**.

```text
src/
├── controllers/
│   ├── atualizaDadosController.js
│   ├── cadastroController.js
│   ├── consultaExtratosController.js
│   ├── consultasController.js
│   ├── criaContaController.js
│   ├── deletaDadosController.js
│   ├── depositoController.js
│   ├── loginController.js
│   ├── participacoesController.js
│   └── transferenciaController.js
│
├── database/
│   └── database.js
│
├── helpers/
│   ├── criaUsuarioEContaSetup.js
│   └── setupDb.js
│
├── middlewares/
│   └── auth.js
│
├── routes/
│   ├── atualizaDadosRoute.js
│   ├── cadastroRoute.js
│   ├── consultaExtratosRoute.js
│   ├── consultasRoute.js
│   ├── criaContaRoute.js
│   ├── deletaDadosRoute.js
│   ├── depositoRoute.js
│   ├── loginRoute.js
│   ├── participacoesRoute.js
│   └── transferenciaRoute.js
│
└── services/
    ├── atualizaDados.js
    ├── consulta.js
    ├── consultaExtratos.js
    ├── criaConta.js
    ├── deletaDados.js
    ├── deposito.js
    ├── transferencia.js
    └── usuarioService.js
```

A separação permite manter as regras de negócio nos services, o tratamento das requisições nos controllers e o gerenciamento dos endpoints nas routes.

---

## Banco de dados

O projeto utiliza **SQLite** através da biblioteca `better-sqlite3`.

O banco possui três tabelas principais:

```text
Usuario
   │
   │ 1:N
   ▼
Conta
   │
   │ 1:N
   ▼
Transacao
```

### Usuario

Responsável pelo armazenamento dos usuários da aplicação.

Principais campos:

- `UsuarioId`
- `Email`
- `Senha`

O e-mail possui restrição de unicidade.

### Conta

Representa as contas pertencentes aos usuários.

Principais campos:

- `ContaId`
- `Titular`
- `Saldo`
- `UsuarioId`

Cada conta possui uma chave estrangeira relacionada ao usuário responsável por ela.

### Transacao

Armazena as operações realizadas entre contas.

Principais campos:

- `TransacaoId`
- `Tipo`
- `Valor`
- `ContaOrigemId`
- `ContaDestinoId`

As contas de origem e destino são referências para a tabela `Conta`.

Isso permite registrar operações como:

```text
Conta A ───────► Conta B
       transferência
```

Enquanto um depósito pode não possuir uma conta de origem.

---

## Integridade do banco

Foram utilizadas diferentes restrições do SQLite para manter a integridade dos dados:

- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `CHECK`

Também foi habilitado o uso de foreign keys no SQLite:

```js
db.pragma("foreign_keys = ON");
```

Entre as regras implementadas estão:

- saldo não pode ser negativo;
- valor de uma operação deve ser positivo;
- e-mail de usuário não pode ser duplicado;
- referências de contas devem existir;
- cada conta deve estar vinculada a um usuário.

---

## Transações

Um dos principais objetivos do projeto foi praticar **transações no SQLite**.

As transferências precisam atualizar mais de um registro:

```text
1. Debitar conta de origem
2. Creditar conta de destino
3. Registrar a transação
```

Essas operações precisam ser tratadas como uma única operação lógica.

Caso alguma etapa falhe, a transação pode realizar rollback, evitando que o banco fique em um estado inconsistente.

O projeto utiliza o mecanismo de transações disponibilizado pelo `better-sqlite3`.

---

## Autenticação e autorização

A API utiliza **JSON Web Token (JWT)** para autenticação.

O fluxo principal é:

```text
Login
  │
  ▼
JWT
  │
  ▼
Middleware de autenticação
  │
  ▼
req.UsuarioId
  │
  ▼
Controller
  │
  ▼
Service
```

O `UsuarioId` utilizado nas operações protegidas é obtido a partir do usuário autenticado.

Dessa forma, operações como criação de conta não precisam confiar em um `UsuarioId` enviado pelo cliente.

Por exemplo:

```text
Usuário autenticado
        │
        ▼
   UsuarioId
        │
        ▼
   criaConta()
        │
        ▼
Conta.UsuarioId
```

---

## Criação de contas

Usuários autenticados podem criar novas contas.

A criação recebe as informações necessárias da conta e utiliza o usuário autenticado como proprietário.

O ID da nova conta é obtido através do `lastInsertRowid` disponibilizado pelo SQLite.

O fluxo é:

```text
POST /cria-conta
       │
       ▼
Authentication Middleware
       │
       ▼
Controller
       │
       ▼
Service
       │
       ▼
INSERT INTO Conta
       │
       ▼
lastInsertRowid
       │
       ▼
201 Created
```

---

## Extratos

O projeto possui uma consulta de extratos utilizando `JOIN` entre as tabelas relacionadas.

As transações podem possuir uma conta de origem e uma conta de destino, permitindo recuperar informações como:

- ID da transação;
- tipo da operação;
- valor;
- conta de origem;
- titular da conta de origem;
- conta de destino;
- titular da conta de destino.

As consultas também são filtradas de acordo com o usuário autenticado.

Isso permite que um usuário consulte somente as transações relacionadas às suas próprias contas.

---

## Validações

As regras de negócio são aplicadas principalmente na camada de services.

Entre as validações implementadas:

- campos obrigatórios;
- tipos de dados;
- valores positivos;
- saldo suficiente para transferências;
- existência de registros;
- usuário autenticado;
- integridade dos relacionamentos;
- regras relacionadas à criação de contas.

Os erros de negócio são tratados pelos controllers e convertidos em respostas HTTP apropriadas.

---

## Testes

O projeto possui testes automatizados utilizando:

- Jest
- Supertest
- SQLite em memória para cenários de teste

A estrutura de testes inclui cenários relacionados a:

```text
tests/
├── atualizacao.test.js
├── autenticacao.test.js
├── consulta.test.js
├── consultaParticipacoes.test.js
├── criaConta.test.js
├── delete.test.js
├── deposito.test.js
├── extrato.test.js
└── transferencia.test.js
```

Os testes cobrem diferentes partes da aplicação, incluindo:

- autenticação;
- cadastro;
- consultas;
- atualização;
- exclusão;
- criação de contas;
- depósitos;
- transferências;
- extratos;
- regras envolvendo saldo;
- relacionamentos entre usuários e contas.

Além dos testes automatizados, as principais rotas também foram verificadas manualmente durante o desenvolvimento.

---

## Banco de dados para testes

Para evitar interferência entre os testes e os dados utilizados pela aplicação, foram utilizados bancos separados para os cenários de teste.

Também foram utilizados bancos em memória em determinados testes:

```js
const dbTest = new Database(":memory:");
```

Isso permite executar os testes utilizando um banco isolado e descartável.

---

## CI

O projeto possui integração com **GitHub Actions** para execução automatizada dos testes.

O workflow está localizado em:

```text
.github/
└── workflows/
    └── ci.yml
```

A ideia é garantir que a suíte de testes seja executada automaticamente durante o processo de versionamento do projeto.

---

## Docker

O projeto também possui configuração para execução utilizando Docker.

Para criar a imagem:

```bash
docker build -t conta-api .
```

Para executar o container:

```bash
docker run -p 3000:3000 conta-api
```

---

## Instalação

### 1. Clone o repositório

```bash
git clone <https://github.com/GabrielSenziani/LiteCheckTransaction.git>
```

### 2. Entre na pasta

```bash
cd ContaApi
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias para execução da aplicação.

### 5. Execute a aplicação

```bash
npm start
```

A API será iniciada na porta configurada pela aplicação.

---

## Executando os testes

Para executar a suíte de testes:

```bash
npm test
```

Os testes utilizam bancos isolados para evitar interferência nos dados da aplicação.

---

## Deploy

A API foi disponibilizada no **Render** para permitir acesso remoto e demonstrar o funcionamento da aplicação.

O deploy possui finalidade principalmente demonstrativa.

Como o projeto utiliza SQLite com armazenamento local, ele não foi projetado para utilizar esse banco como uma solução de persistência de produção em um ambiente com filesystem efêmero.

Para utilização em produção, uma evolução natural seria utilizar um banco de dados persistente, como PostgreSQL.

---

## Principais conceitos praticados

O principal objetivo deste projeto foi utilizar uma aplicação real para consolidar conhecimentos de backend e bancos de dados relacionais.

Durante o desenvolvimento foram praticados:

### SQLite e SQL

- criação de tabelas;
- `INSERT`;
- `SELECT`;
- `UPDATE`;
- `DELETE`;
- `WHERE`;
- `JOIN`;
- chaves primárias;
- chaves estrangeiras;
- constraints;
- relacionamentos;
- transações;
- rollback.

### Node.js

- Express;
- organização em camadas;
- controllers;
- services;
- routes;
- middlewares;
- tratamento de erros;
- integração com banco de dados.

### Autenticação

- JWT;
- middleware de autenticação;
- identificação do usuário autenticado;
- proteção de recursos.

### Testes

- Jest;
- Supertest;
- testes de regras de negócio;
- banco de dados isolado;
- testes de integração.

### Ferramentas

- Git;
- GitHub;
- GitHub Actions;
- Docker;
- Render.

---

## Objetivo do projeto

O ContaApi foi desenvolvido principalmente como um **projeto de estudo e prática de backend e SQLite**.

A ideia foi sair de exercícios isolados de SQL e aplicar os conceitos em uma aplicação que possuísse:

- regras de negócio;
- autenticação;
- relacionamentos;
- operações financeiras;
- transações;
- testes;
- CI;
- deploy.

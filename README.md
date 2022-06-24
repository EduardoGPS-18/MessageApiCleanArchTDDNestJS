# API@RTC

#### Conteúdos disponíveis

- [API@RTC](#apirtc)
      - [Conteúdos disponíveis](#conteúdos-disponíveis)
      - [Sobre o projeto](#sobre-o-projeto)
      - [Tecnologias utilizadas](#tecnologias-utilizadas)
      - [Dependências do projeto](#dependências-do-projeto)
      - [Migrations](#migrations)
      - [Execução do projeto](#execução-do-projeto)
        - [Configuração](#configuração)
        - [Instalação e execução](#instalação-e-execução)
        - [Testes](#testes)
      - [Deploy](#deploy)
      - [Contribuições](#contribuições)



#### Sobre o projeto

O projeto consiste em um RTC(realtime chat) que foi desenvolvido para fixar conhecimentos como uso do TypeORM, e implementação de WebSockets e aplicar conceitos e conhecimentos como Arquitetura limpa e TDD. O projeto possui features como a criar/authenticar usuários, como criar grupos de conversas e enviar mensagens para o grupo.

**[Documentação da API (Swagger) »]()**
**[Documentação do Projeto (Google Docs) »]()**
**[Documentação do Frontend (Layout Figma) »]()**

#### Tecnologias utilizadas

- Ambiente node utilizando a linguagem - Typescript
- Framework utilizado - NestJS
- Sistema de Mensagerias - Apache Kafka
- Utilização de containers - Docker

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)


#### Dependências do projeto

- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com)
- [NestJs CLI](https://nestjs.com/) (Opcional)


#### Migrations

Neste projeto deve ser feito o versionamento do banco de dados, então para isto temos alguns comandos:

```bash
$ yarn run migrate:latest # Isto irá executar as migrations
$ yarn run migrate:revert # Isto irá reverter as migrations
$ yarn run migrate:generate <nome_migration> # Isto gerará uma nova migration a partir da entidade
$ yarn run migrate:create <nome_migration> # Isto criará uma migration vazia
```


#### Execução do projeto
	
##### Configuração

Este projeto possui um arquivo de variáveis de ambiente, devemos cria-lo e colocalo na raiz do projeto com as seguintes chaves:
```bash
  VARIAVEL_1=
  VARIAVEL_2=
```


##### Instalação e execução

A Infraestrutura deste projeto foi desenvolvida com base em Containers, usando o Docker & Docker Compose, para **inicializar** a infraestrutura em modo desenvolvimento: 

```bash
$ docker-compose up 
```
  OU
```bash
$ yarn run:compose-dev
```

Obs: Este comando irá **instalar** e **executar** os seguintes containers **[node:18-alpine](https://hub.docker.com/_/node)** o **[apache kafka](https://hub.docker.com/r/confluentinc/cp-kafka)** e o **[postgres:14.4](https://hub.docker.com/_/postgres)**, e ainda executará as migrations.


##### Testes

Este projeto está sendo desenvolvido além das features os testes para a segurança do projeto, para executar os testes basta rodar:
```bash
$ yarn run test:watch # Rodará os testes em modo "live reload"
$ yarn run test:debug # Rodará os testes e exibirá a cobertura dos testes
$ yarn run test       # Rodará os teste somente 
```

#### Deploy

Este projeto está/será hospedado na AWS e está sendo utilizado CI/CD.

Na branch **develop** ao ser feito um merge atualizara a api de desenvolvimento:
```
  https://host-dev.com/api/
```
Na branch **master** ao ser feito um merge atualizara a api de produção:
```
  https://host-prod.com/api/
```


#### Contribuições

Participaram deste projeto os devs:
​
| Foto | Nome | E-mail |
|----|--------------------| ------------------------|
| 👨🏼‍💻 | **Eduardo Silva**  | [eduardo.silva@usemobile.xyz]()|
| 👨🏼‍💻 | **Outros devs...** | [outros.devs@usemobile.xyz]() |

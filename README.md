# Karhub Challenge - Documentação

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

## Visão Geral

Este projeto é composto por um gateway de API e múltiplos microserviços, todos desenvolvidos com [NestJS](https://nestjs.com/) e [TypeScript](https://www.typescriptlang.org/). Ele utiliza uma arquitetura modular e escalável, facilitando a manutenção, testes e evolução do sistema.

#### OBS: Não foi adicionado sistema de autenticação para facilitar os testes e o uso da API. O foco principal é demonstrar a arquitetura de microserviços, a modularidade e a integração entre os serviços.

---

## Estrutura do Projeto

A estrutura do projeto segue o padrão monorepo, utilizando o NestJS para organizar múltiplos aplicativos (apps) e bibliotecas compartilhadas (libs):

```
├── apps/
│   ├── api-gateway/         # Gateway principal de entrada das requisições
│   │   ├── src/
│   │   │   ├── modules/     # Módulos de domínio (beer-machine, beer-styles, beers, breweries)
│   │   │   └── ...
│   │   └── test/            # Testes e2e do gateway
│   ├── beer-catalog/        # Microserviço de catálogo de cervejas
│   │   ├── src/modules/     # Módulos: beer-styles, beers, breweries
│   │   └── ...
│   └── beer-machine/        # Microserviço de máquina de cerveja
│       ├── src/modules/     # Módulo spotify e outros
│       └── ...
├── libs/
│   ├── common/              # Bibliotecas compartilhadas (DTOs, entidades, filtros, utils)
│   └── core/                # Integração com banco de dados (Prisma)
├── prisma/                  # Migrations, seeds e schema do Prisma ORM
├── docker-compose.yml       # Orquestração dos serviços com Docker
├── Dockerfile               # Dockerfile base para apps
├── package.json             # Dependências e scripts globais
├── pnpm-lock.yaml           # Lockfile do gerenciador pnpm
└── ...
```

### Descrição dos Diretórios
- **apps/**: Contém os aplicativos principais (gateway e microserviços), cada um com sua própria estrutura de módulos e testes.
- **libs/**: Bibliotecas reutilizáveis, como DTOs, entidades, filtros e integrações com banco de dados.
- **prisma/**: Schema, migrations e seeds do banco de dados, utilizando Prisma ORM.
- **docker-compose.yml**: Orquestração dos serviços para ambiente local.
- **Dockerfile**: Imagem base para os serviços Node.js/NestJS.

---

## Principais Dependências

- [NestJS](https://nestjs.com/): Framework Node.js para aplicações escaláveis.
- [TypeScript](https://www.typescriptlang.org/): Tipagem estática para JavaScript.
- [Prisma ORM](https://www.prisma.io/): ORM para banco de dados relacional.
- [pnpm](https://pnpm.io/): Gerenciador de pacotes rápido e eficiente.
- [Jest](https://jestjs.io/): Testes unitários e e2e.
- [Docker](https://www.docker.com/): Contêinerização dos serviços.
- [ESLint](https://eslint.org/): Linting e padronização de código.
- [Compodoc](https://compodoc.app/): Documentação automática do código.
- [Swagger](https://swagger.io/): Documentação interativa da API.

---

## Recursos e Tecnologias Utilizadas

- **Arquitetura Modular**: Separação clara entre gateway, microserviços e bibliotecas compartilhadas.
- **Prisma ORM**: Migrations, seeds e integração eficiente com bancos de dados relacionais.
- **Testes Automatizados**: Testes unitários e de integração com Jest.
- **Docker & Docker Compose**: Facilita o setup e execução local dos serviços.
- **Padronização de Código**: ESLint e configuração de TypeScript.
- **Documentação Interativa**: Swagger para fácil acesso à API e Compodoc para documentação do código.

---

## Como Rodar o Projeto Localmente com Docker

1. **Pré-requisitos**:
   - [Docker](https://www.docker.com/get-started) instalado (Siga as instruções oficiais de instalação para o seu sistema operacional)
   - [Docker Compose](https://docs.docker.com/compose/) instalado (Siga as instruções oficiais de instalação para o seu sistema operacional)
   - [Spotify - Client ID e Secret](https://developer.spotify.com/documentation/general/guides/app-settings/) (Crie uma conta de desenvolvedor no Spotify e obtenha as credenciais)

2. **Configuração do Ambiente**:
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:
     ```env
     # Spotify API
     SPOTIFY_CLIENT_ID=<seu_spotify_client_id>
     SPOTIFY_CLIENT_SECRET=<seu_spotify_client_secret>
    
     # PostgreSQL
     POSTGRES_USER=karhub
     POSTGRES_PASSWORD=supersecret
     POSTGRES_DB=karhub
     DATABASE_URL="postgresql://karhub:supersecret@postgres:5432/karhub?schema=public"
    
     # Redis
     REDIS_URL="redis://redis:6379"
    
     # RabbitMQ
     RABBITMQ_URL="amqp://guest:guest@rabbitmq:5672"
    
     # Docker Compose
     COMPOSE_BAKE=true
     ```
   - Certifique-se de que o Docker e o Docker Compose estão funcionando corretamente.

3. **Configurar credenciais do Spotify**:
   - Crie um aplicativo no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications) e obtenha o `Client ID` e `Client Secret`.
   - Substitua o valor das variáveis SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET com os valores obtidos na etapa anterior. 

4. **Suba os serviços Localmente**:

```bash
  docker-compose up --build
```

Isso irá:
- Construir as imagens dos serviços
- Subir o banco de dados e todos os microserviços
- Cadastrar dados mockados no banco de dados
- Expor as portas configuradas (consulte o docker-compose.yml para detalhes)

5. **Acessando o Gateway**:
   - O API Gateway estará disponível em `http://localhost:3000` (ou porta configurada) e o Swagger em `http://localhost:3000/api/swagger`.

6. **Parar os serviços**:

```bash
  docker-compose down
```

---

## Scripts Úteis

- Instalar dependências:
  ```bash
  pnpm install
  ```
- Rodar localmente (sem Docker):
  ```bash
  pnpm run start:dev <NOME_APP>
  ```
- Rodar testes:
  ```bash
  pnpm run test
  pnpm run test:e2e
  pnpm run test:cov
  ```

---

## Documentação
- Para acessar a documentação detalhada e interativa do projeto (em inglês), execute o seguinte comando:
```bash
  pnpm compodoc
```
- A documentação gerada estará disponível em `http://localhost:8080/` após a execução do comando acima.

---

## Testes

- Testes unitários e de integração estão localizados em cada app, dentro da pasta `test/`.
- Para rodar todos os testes:
  ```bash
  pnpm run test
  ```
- Para cobertura:
  ```bash
  pnpm run test:cov
  ```

## Licença

MIT. Veja o arquivo [LICENSE](https://github.com/engfernandes/karhub-microservices-challenge/blob/main/LICENSE).

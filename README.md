# 🚀 easy-api-creator-cli

CLI poderosa para criar projetos Express + Sequelize com boilerplate completo e REST API de exemplo em segundos.

![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## ✨ Features

- ✅ **Express + Sequelize + Morgan** configurado e pronto para uso
- ✅ **Estrutura MVC** organizada e escalável
- ✅ **REST API CRUD** de exemplo (Users)
- ✅ **Autenticação JWT** opcional
- ✅ **Validação de dados** com express-validator
- ✅ **Suporte múltiplos bancos**: PostgreSQL, MySQL e SQLite
- ✅ **Variáveis de ambiente** pré-configuradas
- ✅ **Scripts prontos** no package.json
- ✅ **Segurança** com Helmet e CORS
- ✅ **README completo** com documentação

## 📋 Pré-requisitos

- Node.js >= 14.0.0
- npm ou yarn
- PostgreSQL/MySQL (opcional, se escolher SQLite não precisa)

## 📦 Instalação e Uso

### Uso com npx (Recomendado - Não precisa instalar)

```bash
npx easy-api-creator-cli meu-projeto
```

### Instalação Global

```bash
npm install -g easy-api-creator-cli
easy-api-creator-cli meu-projeto
```

## 🎯 Modos de Uso

### Modo Interativo (Recomendado)

```bash
easy-api-creator-cli
```

O CLI vai perguntar:
- ✏️ Nome do projeto
- 🗄️ Banco de dados (PostgreSQL, MySQL ou SQLite)
- 🔐 Se deseja autenticação JWT
- 📦 Se deseja instalar dependências automaticamente

### Modo Direto com Argumentos

```bash
# Criar com todas as opções padrão
easy-api-creator-cli meu-projeto

# Especificar banco de dados
easy-api-creator-cli meu-projeto --database mysql

# Sem autenticação
easy-api-creator-cli meu-projeto --no-auth

# Sem instalar dependências
easy-api-creator-cli meu-projeto --skip-install
```

### Opções Disponíveis

```
Uso: easy-api-creator-cli [options] [project-name]

Argumentos:
  project-name                  Nome do projeto

Opções:
  -V, --version                 Mostrar versão
  -d, --database <type>         Tipo de banco (postgres, mysql, sqlite) [default: postgres]
  -a, --auth                    Incluir autenticação JWT [default: true]
  -s, --skip-install            Pular instalação de dependências
  -h, --help                    Mostrar ajuda
```

## 📁 Estrutura Gerada

```
meu-projeto/
├── src/
│   ├── config/
│   │   └── database.js           # Configuração do Sequelize
│   ├── controllers/
│   │   ├── UserController.js     # CRUD de usuários
│   │   └── AuthController.js     # Login e autenticação (opcional)
│   ├── middlewares/
│   │   ├── auth.js               # Verificação de token JWT (opcional)
│   │   └── validators.js         # Validação de dados
│   ├── models/
│   │   ├── index.js              # Loader do Sequelize
│   │   └── User.js               # Model de usuário
│   ├── routes/
│   │   ├── index.js              # Agregador de rotas
│   │   ├── users.js              # Rotas de usuários
│   │   └── auth.js               # Rotas de auth (opcional)
│   ├── services/                 # Lógica de negócio complexa
│   ├── utils/                    # Funções auxiliares
│   └── app.js                    # Arquivo principal
├── .env.example                  # Template de variáveis
├── .gitignore                    # Arquivos ignorados pelo Git
├── .sequelizerc                  # Configuração do Sequelize CLI
├── package.json                  # Dependências e scripts
└── README.md                     # Documentação do projeto
```

## 🚀 Primeiros Passos

Após criar o projeto:

```bash
# 1. Entre na pasta do projeto
cd meu-projeto

# 2. Copie o arquivo de configuração
cp .env.example .env

# 3. Configure suas variáveis de ambiente
nano .env  # ou use seu editor preferido

# 4. (Apenas se escolheu PostgreSQL/MySQL) Crie o banco de dados
createdb myapp_db  # PostgreSQL
# ou
mysql -u root -p -e "CREATE DATABASE myapp_db;"  # MySQL

# 5. Inicie o servidor
npm run dev
```

## 📚 Endpoints Gerados

### Health Check
```
GET /api/health - Verifica status da API
```

### Users
```
GET    /api/users     - Listar todos os usuários
GET    /api/users/:id - Buscar usuário por ID
POST   /api/users     - Criar novo usuário
PUT    /api/users/:id - Atualizar usuário
DELETE /api/users/:id - Deletar usuário
```

### Authentication (se incluído)
```
POST /api/auth/login - Fazer login (retorna token JWT)
GET  /api/auth/me    - Obter dados do usuário autenticado
```

## 🔐 Exemplos de Uso da API

### Criar um usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "123456"
  }'
```

### Login (se autenticação estiver habilitada)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "123456"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Listar usuários (com autenticação)

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## ⚙️ Configuração do .env

### PostgreSQL
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_db
DB_USER=postgres
DB_PASS=sua_senha
DB_DIALECT=postgres

JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
```

### MySQL
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=myapp_db
DB_USER=root
DB_PASS=sua_senha
DB_DIALECT=mysql

JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
```

### SQLite
```env
NODE_ENV=development
PORT=3000

DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
```

## 🗄️ Migrations e Seeds

### Criar uma migration

```bash
npx sequelize-cli migration:generate --name create-posts
```

### Executar migrations

```bash
npm run db:migrate
```

### Criar um seeder

```bash
npx sequelize-cli seed:generate --name demo-users
```

### Executar seeders

```bash
npm run db:seed
```

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia servidor em produção
npm run dev        # Inicia servidor em desenvolvimento (nodemon)
npm run db:migrate # Executa migrations do Sequelize
npm run db:seed    # Executa seeders do Sequelize
```

## 📦 Dependências Incluídas

### Produção
- **express** - Framework web
- **sequelize** - ORM para Node.js
- **pg/mysql2/sqlite3** - Driver do banco escolhido
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Habilita CORS
- **helmet** - Segurança HTTP headers
- **express-validator** - Validação de dados
- **bcryptjs** - Hash de senhas (se auth)
- **jsonwebtoken** - Geração de tokens JWT (se auth)

### Desenvolvimento
- **nodemon** - Auto-reload do servidor
- **sequelize-cli** - CLI do Sequelize

## 🔧 Desenvolvimento Local da CLI

Quer contribuir ou testar localmente?

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/easy-api-creator-cli.git
cd easy-api-creator-cli

# Instale as dependências
npm install

# Link localmente
npm link

# Teste
easy-api-creator-cli test-project
```

## 🐛 Troubleshooting

### Erro: "command not found: easy-api-creator-cli"
**Solução:** Execute `npm link` novamente na pasta da CLI

### Erro ao conectar com o banco de dados
**Solução:** 
- Verifique se o banco está rodando
- Confira as credenciais no `.env`
- Para PostgreSQL: `createdb myapp_db`
- Para MySQL: `mysql -u root -p -e "CREATE DATABASE myapp_db;"`

### Erro ao instalar dependências
**Solução:** A CLI vai avisar. Execute `npm install` manualmente na pasta do projeto

### Porta 3000 já está em uso
**Solução:** Altere a variável `PORT` no arquivo `.env`

## 📝 Roadmap

- [ ] Suporte para MongoDB
- [ ] Templates de Docker e docker-compose
- [ ] Testes com Jest pré-configurados
- [ ] Documentação Swagger/OpenAPI
- [ ] GitHub Actions para CI/CD
- [ ] Logs com Winston
- [ ] Rate limiting
- [ ] Upload de arquivos com Multer
- [ ] Paginação nas listagens
- [ ] Soft delete nos models

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Seu Nome**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)
- Email: seu@email.com

## ⭐ Mostre seu apoio

Se este projeto te ajudou, dê uma ⭐!

---

**Feito com ❤️ e Node.js**

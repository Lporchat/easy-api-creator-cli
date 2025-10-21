function getTemplates({ database, auth }) {
  const templates = {};

  // package.json
  const dependencies = {
    express: '^4.18.2',
    sequelize: '^6.35.2',
    dotenv: '^16.3.1',
    cors: '^2.8.5',
    helmet: '^7.1.0',
    morgan: "^1.10.1",
    'express-validator': '^7.0.1'
  };

  // Adicionar driver do banco
  if (database === 'postgres') {
    dependencies.pg = '^8.11.3';
    dependencies['pg-hstore'] = '^2.3.4';
  } else if (database === 'mysql') {
    dependencies.mysql2 = '^3.6.5';
  } else if (database === 'sqlite') {
    dependencies.sqlite3 = '^5.1.6';
  }

  // Adicionar deps de autenticação
  if (auth) {
    dependencies.bcryptjs = '^2.4.3';
    dependencies.jsonwebtoken = '^9.0.2';
  }

  templates['package.json'] = JSON.stringify({
    name: 'express-sequelize-api',
    version: '1.0.0',
    description: 'REST API com Express e Sequelize',
    main: 'src/app.js',
    scripts: {
      start: 'node src/app.js',
      dev: 'nodemon src/app.js',
      'db:migrate': 'npx sequelize-cli db:migrate',
      'db:seed': 'npx sequelize-cli db:seed:all'
    },
    dependencies,
    devDependencies: {
      nodemon: '^3.0.2',
      'sequelize-cli': '^6.6.2'
    }
  }, null, 2);

  // .env.example
  templates['.env.example'] = `NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=${database === 'postgres' ? '5432' : database === 'mysql' ? '3306' : ''}
DB_NAME=myapp_db
DB_USER=postgres
DB_PASS=postgres
DB_DIALECT=${database}
${database === 'sqlite' ? 'DB_STORAGE=./database.sqlite' : ''}

${auth ? `# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d` : ''}
`;

  // .gitignore
  templates['.gitignore'] = `node_modules/
.env
*.log
.DS_Store
${database === 'sqlite' ? 'database.sqlite' : ''}
`;

  // src/config/database.js
  templates['src/config/database.js'] = `require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    ${database === 'sqlite' ? 'storage: process.env.DB_STORAGE,' : ''}
    logging: false
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    ${database === 'sqlite' ? 'storage: \':memory:\',' : ''}
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    ${database === 'sqlite' ? 'storage: process.env.DB_STORAGE,' : ''}
    logging: false
  }
};
`;

  // .sequelizerc
  templates['.sequelizerc'] = `const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
`;

  // src/models/index.js
  templates['src/models/index.js'] = `const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
`;

  // src/models/User.js
  templates['src/models/User.js'] = `module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    ${auth ? `password: {
      type: DataTypes.STRING,
      allowNull: false
    },` : ''}
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};
`;

  // src/controllers/UserController.js
  templates['src/controllers/UserController.js'] = `const { User } = require('../models');
${auth ? "const bcrypt = require('bcryptjs');" : ''}

class UserController {
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ${auth ? "['password']" : "[]"} }
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ${auth ? "['password']" : "[]"} }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async store(req, res) {
    try {
      const { name, email${auth ? ', password' : ''} } = req.body;

      ${auth ? `const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });` : `const user = await User.create({ name, email });`}

      const userResponse = user.toJSON();
      ${auth ? "delete userResponse.password;" : ''}

      return res.status(201).json(userResponse);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.update({ name, email });

      const userResponse = user.toJSON();
      ${auth ? "delete userResponse.password;" : ''}

      return res.json(userResponse);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = new UserController();
`;

  if (auth) {
    // src/controllers/AuthController.js
    templates['src/controllers/AuthController.js'] = `const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const userResponse = user.toJSON();
      delete userResponse.password;

      return res.json({ user: userResponse, token });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }
}

module.exports = new AuthController();
`;

    // src/middlewares/auth.js
    templates['src/middlewares/auth.js'] = `const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
`;
  }

  // src/middlewares/validators.js
  templates['src/middlewares/validators.js'] = `const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidator = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  ${auth ? "body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')," : ''}
  validate
];

${auth ? `const authValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  validate
];` : ''}

module.exports = {
  userValidator,
  ${auth ? 'authValidator,' : ''}
  validate
};
`;

  // src/routes/users.js
  templates['src/routes/users.js'] = `const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { userValidator } = require('../middlewares/validators');
${auth ? "const auth = require('../middlewares/auth');" : ''}

router.get('/', ${auth ? 'auth, ' : ''}UserController.index);
router.get('/:id', ${auth ? 'auth, ' : ''}UserController.show);
router.post('/', userValidator, UserController.store);
router.put('/:id', ${auth ? 'auth, ' : ''}userValidator, UserController.update);
router.delete('/:id', ${auth ? 'auth, ' : ''}UserController.destroy);

module.exports = router;
`;

  if (auth) {
    // src/routes/auth.js
    templates['src/routes/auth.js'] = `const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authValidator } = require('../middlewares/validators');
const auth = require('../middlewares/auth');

router.post('/login', authValidator, AuthController.login);
router.get('/me', auth, AuthController.me);

module.exports = router;
`;
  }

  // src/routes/index.js
  templates['src/routes/index.js'] = `const express = require('express');
const router = express.Router();

const usersRouter = require('./users');
${auth ? "const authRouter = require('./auth');" : ''}

router.use('/users', usersRouter);
${auth ? "router.use('/auth', authRouter);" : ''}

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
`;

  // src/app.js
  templates['src/app.js'] = `require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(\`🚀 Servidor rodando na porta \${PORT}\`);
    console.log(\`📚 Ambiente: \${process.env.NODE_ENV || 'development'}\`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco de dados:', err);
});
`;

  // README.md
  templates['README.md'] = `# Express + Sequelize API

REST API criada com Express e Sequelize.

## 🚀 Tecnologias

- Node.js
- Express
- Sequelize ORM
- ${database === 'postgres' ? 'PostgreSQL' : database === 'mysql' ? 'MySQL' : 'SQLite'}
${auth ? '- JWT Authentication' : ''}

## 📦 Instalação

\`\`\`bash
npm install
\`\`\`

## ⚙️ Configuração

1. Copie o arquivo de exemplo:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Configure as variáveis de ambiente no arquivo \`.env\`

${database !== 'sqlite' ? `3. Crie o banco de dados:
\`\`\`bash
# PostgreSQL
createdb myapp_db

# MySQL
mysql -u root -p -e "CREATE DATABASE myapp_db;"
\`\`\`` : ''}

## 🎯 Uso

### Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

### Produção
\`\`\`bash
npm start
\`\`\`

## 📚 Endpoints

### Users
- \`GET /api/users\` - Listar todos os usuários
- \`GET /api/users/:id\` - Buscar usuário por ID
- \`POST /api/users\` - Criar novo usuário
- \`PUT /api/users/:id\` - Atualizar usuário
- \`DELETE /api/users/:id\` - Deletar usuário

${auth ? `### Authentication
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/me\` - Obter dados do usuário autenticado

#### Exemplo de Login:
\`\`\`json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "123456"
}
\`\`\`

#### Usar o token:
\`\`\`
Authorization: Bearer {seu-token-jwt}
\`\`\`` : ''}

### Health Check
- \`GET /api/health\` - Verificar status da API

## 🗄️ Migrations

\`\`\`bash
# Criar migration
npx sequelize-cli migration:generate --name nome-da-migration

# Executar migrations
npm run db:migrate
\`\`\`

## 📝 Licença

MIT
`;

  return templates;
}

module.exports = { getTemplates };
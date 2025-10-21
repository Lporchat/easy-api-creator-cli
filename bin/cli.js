#!/usr/bin/env node

const { program } = require('commander');
const prompts = require('prompts');
const chalk = require('chalk');
const path = require('path');
const { createProject } = require('../lib/create-project');

program
  .version('1.0.0')
  .description('Cria um projeto Express + Sequelize com boilerplate completo')
  .argument('[project-name]', 'Nome do projeto')
  .option('-d, --database <type>', 'Tipo de banco de dados (postgres, mysql, sqlite)', 'postgres')
  .option('-a, --auth', 'Incluir autenticação JWT', true)
  .option('-s, --skip-install', 'Pular instalação de dependências', false)
  .action(async (projectName, options) => {
    try {
      let finalProjectName = projectName;
      let database = options.database;

      // Se não passou o nome do projeto, perguntar
      if (!finalProjectName) {
        const response = await prompts({
          type: 'text',
          name: 'projectName',
          message: 'Qual o nome do seu projeto?',
          initial: 'my-express-api',
          validate: value => value.length > 0 ? true : 'Por favor, informe um nome'
        });

        if (!response.projectName) {
          console.log(chalk.red('\n✖ Operação cancelada'));
          process.exit(1);
        }

        finalProjectName = response.projectName;
      }

      // Perguntas adicionais
      const answers = await prompts([
        {
          type: 'select',
          name: 'database',
          message: 'Qual banco de dados você vai usar?',
          choices: [
            { title: 'PostgreSQL', value: 'postgres' },
            { title: 'MySQL', value: 'mysql' },
            { title: 'SQLite', value: 'sqlite' }
          ],
          initial: 0
        },
        {
          type: 'confirm',
          name: 'auth',
          message: 'Incluir autenticação JWT?',
          initial: true
        },
        {
          type: 'confirm',
          name: 'installDeps',
          message: 'Instalar dependências agora?',
          initial: true
        }
      ]);

      if (!answers.database) {
        console.log(chalk.red('\n✖ Operação cancelada'));
        process.exit(1);
      }

      console.log(chalk.cyan('\n🚀 Criando seu projeto...\n'));

      await createProject({
        projectName: finalProjectName,
        database: answers.database,
        auth: answers.auth,
        installDeps: answers.installDeps
      });

      console.log(chalk.green('\n✔ Projeto criado com sucesso!\n'));
      console.log(chalk.cyan('Para começar:\n'));
      console.log(chalk.white(`  cd ${finalProjectName}`));
      
      if (!answers.installDeps) {
        console.log(chalk.white('  npm install'));
      }
      
      console.log(chalk.white('  cp .env.example .env'));
      console.log(chalk.white('  # Configure suas variáveis de ambiente'));
      console.log(chalk.white('  npm run dev\n'));

    } catch (error) {
      console.error(chalk.red('\n✖ Erro ao criar projeto:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
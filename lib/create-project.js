const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');
const { getTemplates } = require('./templates');

async function createProject({ projectName, database, auth, installDeps }) {
  const projectPath = path.join(process.cwd(), projectName);

  // Verifica se o diretório já existe
  if (fs.existsSync(projectPath)) {
    throw new Error(`O diretório ${projectName} já existe!`);
  }

  const spinner = ora('Criando estrutura de pastas...').start();

  try {
    // Criar estrutura de pastas
    const folders = [
      'src/config',
      'src/controllers',
      'src/middlewares',
      'src/models',
      'src/routes',
      'src/utils',
      'src/services'
    ];

    for (const folder of folders) {
      await fs.ensureDir(path.join(projectPath, folder));
    }

    spinner.succeed('Estrutura de pastas criada');
    spinner.start('Gerando arquivos...');

    // Obter templates
    const templates = getTemplates({ database, auth });

    // Criar arquivos
    for (const [filePath, content] of Object.entries(templates)) {
      await fs.writeFile(
        path.join(projectPath, filePath),
        content,
        'utf8'
      );
    }

    spinner.succeed('Arquivos gerados');

    // Instalar dependências
    if (installDeps) {
      spinner.start('Instalando dependências (isso pode levar alguns minutos)...');
      
      try {
        execSync('npm install', {
          cwd: projectPath,
          stdio: 'ignore'
        });
        spinner.succeed('Dependências instaladas');
      } catch (error) {
        spinner.warn('Erro ao instalar dependências. Execute "npm install" manualmente.');
      }
    } else {
      spinner.info('Instalação de dependências pulada');
    }

    return projectPath;

  } catch (error) {
    spinner.fail('Erro ao criar projeto');
    // Limpar diretório em caso de erro
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath);
    }
    throw error;
  }
}

module.exports = { createProject };
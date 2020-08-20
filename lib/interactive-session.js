const inquirer = require('inquirer');

const mainInteractiveCommandGitBundler = require('./git-bundler').main;
const mainInteractiveCommandEnvBundler = require('./env-bundler').main;

const mainQuestion = [
  {
    type: 'list',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { value: 'from-git', name: 'Generate a custom-resource based on an existing bundle project' },
      { value: 'from-env', name: 'Create a new bundle using components from an environment' },
    ],
  },
];

async function main () {
  let answers = await inquirer.prompt(mainQuestion);
  
  if (answers.action === 'from-git') {
    mainInteractiveCommandGitBundler();
  } else if (answers.action === 'from-env') {
    mainInteractiveCommandEnvBundler();
  } else {
    console.log(`Illegal command: ${answers.action}`);
  }
}

module.exports = {
  interactiveSession: main,
};

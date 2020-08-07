const inquirer = require('inquirer');
const validUrl = require('valid-url');
const fs = require('fs');
const { validateModuleName } = require('./de_bundle');
var { generateFromGit } = require('./actions');

function isValidPath (path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

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

const fromGitQuestions = [
  {
    type: 'input',
    name: 'repository',
    message: 'What\'s the git repository URL',
    validate: (answer) => {
      if (answer.startsWith('https://') && answer.endsWith('.git')) {
        return true;
      }
      return 'You need to provide a valid git repository URL, which should start with \'https://\' and and with \'.git\'';
    },
  },
  {
    type: 'list',
    name: 'thumbnail',
    message: 'Do you want to use a custom thumbnail for the bundle?',
    choices: [
      { value: 'no', name: 'I don\'t want to provide a thumbnail' },
      { value: 'thumbnailUrl', name: 'I want to provide a URL for the thumbnail' },
      { value: 'thumbnailFile', name: 'I want to provide a file path to the thumbnail' },
    ],
  },
  {
    when: (answers) => answers.thumbnail === 'thumbnailUrl',
    type: 'input',
    name: 'thumbnailUrl',
    message: 'Type the URL where to get the thumbnail',
    validate: (answer) => validUrl.isUri(answer) ? true : 'The provided url is not valid',
  },
  {
    when: (answers) => answers.thumbnail === 'thumbnailFile',
    type: 'input',
    name: 'thumanilFile',
    message: 'Type the path to the thumbnail file',
    validate: (answer) => isValidPath(answer) ? true : 'The provided path doesn\'t exist',
  },
  {
    type: 'input',
    name: 'name',
    message: 'What name do you want to use for the generated custom-resource?',
    validate: (answer) => validateModuleName(answer) ? true : 'Module name is not valid based on this regex /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm',
  },
];

// TODO include the bin/index-inquirer.js questions/logic here here
// const fromEnvQuestions = [
// ];

async function main () {
  let answers = await inquirer.prompt(mainQuestion);
  if (answers.action === 'from-git') {
    answers = await inquirer.prompt(fromGitQuestions);
    console.log(answers);
    generateFromGit(answers);
  } else {
    console.log('Going through from-env section');
  }
}

module.exports = {
  interactiveSession: main,
};

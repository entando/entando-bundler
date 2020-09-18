const yaml = require('js-yaml');
const inquirer = require('inquirer');
const highlight = require('cli-highlight').highlight;

const npmBundler = require('./npm-bundler');
const gitBundler = require('./git-bundler');
const envBundler = require('./env-bundler');
const { convertNpmModuleToEntandoDeBundle, convertGitRepositoryToEntandoDeBundle } = require('./de_bundle');

const k8s = require('./k8s');

function generateInteractively () {
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

  inquirer
    .prompt(mainQuestion)
    .then((answers) => {
      switch (answers.action) {
        case 'from-git':
          gitBundler.interactiveSession().then(answers => generateFromGit(answers));
          break;
        case 'from-env':
          envBundler.interactiveSession().then(answers => generateFromEnv(answers));
          break;
        default:
          console.error(`Illegal command: ${answers.action}`);
          throw new Error(`Illegal command ${answers.action}`);
      }
    })
    .catch(error => {
      console.error('An error occurred while running interactive session', error);
    });
}

function generate (obj, opts) {
  if (opts.dryRun) {
    print(obj);
  } else {
    deploy(obj, opts);
  }
}

function generateFromGit (options) {
  gitBundler
    .getBundleInfo(options)
    .then(bundle =>
      convertGitRepositoryToEntandoDeBundle(bundle, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(error => {
      console.error('An error occurred while generating bundle from git repository:');
      console.error(error);
    });
}

function generateFromNpm (module, options) {
  npmBundler
    .getBundleInfo({ name: module, registry: options.registry })
    .then(mods =>
      convertNpmModuleToEntandoDeBundle(mods, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(err => {
      console.error('An error occurred while generating bundle from npm package:');
      console.error(err);
    });
}

function generateFromEnv (options) {
  envBundler
    .setupEnvironment(options)
    .then(() => envBundler.collectAllComponents())
    .then(components => envBundler.generateBundle(options, components))
    .catch(error => {
      console.error('An error occurred while generating bundle from an existing environment:');
      console.error(error);
    });
}

function print (obj) {
  const output = `---\n${highlight(yaml.safeDump(obj), { language: 'yaml' })}`;
  console.log(output);
}

function deploy (obj, opts) {
  console.log('\nDeploying the bundle on kuberentes\n\n');
  k8s
    .apply(obj, opts)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = {
  generateFromNpm,
  generateFromGit,
  generateFromEnv,
  generateInteractivly: generateInteractively,
};

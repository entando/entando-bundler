#!/usr/bin/env node

const program = require('commander');

const { generateBundle, generateRepositoryBundle } = require('../lib/actions');
const version = require('../package.json').version;

function validateOrExit (validation) {
  if (!validation) {
    program.outputHelp();
    process.exit(1);
  }
}

program.storeOptionsAsProperties(false);
program.passCommandToAction(false);

program.version(version).name('entando-bundle');
program.description("A tool to interact with Entando's Digital-Exchange bundles");

program
  .option('--thumbnail-file <thumb_file>', 'A file to use as a thumbnail for the bundle')
  .option('--thumbnail-url <thumb_url>', 'A URL hosting the image to use as a thumbnail for the bundle')
  .option('--name <name>', 'The name to give to the EntandoDigitalExchangeBundle')
  .option('--namespace <namespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
  .option('--dry-run', 'Print the output instead of create the custom resource automatically')

program
  .command('from-npm <module>')
  .description('Generates an Entando\'s Content Digital-Exchange bundle k8s custom resource')
  .option('--registry <registry>', 'The registry to use for searching the module, by default uses the registry configured in your .npmrc')
  .action(generateBundle);

program
  .command('from-git')
  .description('Generates an Entando\'s Content Digital-Exchange bundle k8s custom resource using repository')
  .option('--repository <repository>', 'Repository URL to be sued for bundle creation')
  .option('--repository-path <repositoryPath>', 'Path to local repository, if local repository should be used (--repository has precedence')
  .action(generateRepositoryBundle);

program.parse(process.argv);
validateOrExit(
  program.rawArgs[2] === 'from-git'
    ? program.args.length === 0
    : program.args.length > 0,
);

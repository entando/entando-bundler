#!/usr/bin/env node

const program = require('commander');

const { generateFromNpm, generateFromGit, generateFromEnv, generateInteractively } = require('../lib/actions');
const version = require('../package.json').version;

program.storeOptionsAsProperties(false);
program.passCommandToAction(false);

program.version(version).name('entando-bundle');
program.description("A tool to interact with Entando's Digital-Exchange bundles");

program
  .command('from-npm <module>')
  .description('Generates an Entando\'s Content Digital-Exchange bundle k8s custom resource')
  .option('--thumbnail-file <thumbnailFile>', 'A file to use as a thumbnail for the bundle')
  .option('--thumbnail-url <thumbnailUrl>', 'A URL hosting the image to use as a thumbnail for the bundle. URL must be surrounded with quotation marks.')
  .option('--name <name>', 'The name to give to the EntandoDigitalExchangeBundle')
  .option('--namespace <namespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
  .option('--dry-run', 'Print the output instead of create the custom resource automatically')
  .option('--registry <registry>', 'The registry to use for searching the module, by default uses the registry configured in your .npmrc')
  .action(generateFromNpm);

program
  .command('from-git')
  .description('Generates an Entando\'s Content Digital-Exchange bundle k8s custom resource using repository')
  .option('--thumbnail-file <thumbnailFile>', 'A file to use as a thumbnail for the bundle')
  .option('--thumbnail-url <thumbnailUrl>', 'An URL hosting the image to use as a thumbnail for the bundle. URL must be surrounded with quotation marks.')
  .option('--name <name>', 'The name to give to the EntandoDigitalExchangeBundle')
  .option('--namespace <namespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
  .option('-d, --dry-run', 'Print the output instead of create the custom resource automatically')
  .option('--no-tags', 'Create bundle without tags, can be used when repository does not have tags available')
  .requiredOption('-r, --repository <repository>', 'Repository URL to be used for bundle creation')
  .action(generateFromGit);

program
  .command('from-env')
  .description('Generates an Entando Bundle from an existing environment into the current or selected location')
  .option('--env <env>', 'The location for the env.json file containing the description of the environment to export', 'env.json')
  .option('--location <location>', 'The location for where to store the generated Bundle', './')
  .option('--exclude-microservices', 'Whether to include microservices in the export')
  .requiredOption('--code <code>', 'The code for the Bundle')
  .requiredOption('--description <description>', 'The description of the Bundle')
  .action(generateFromEnv);

if (process.argv.length > 2) {
  program.parse(process.argv);
} else {
  generateInteractively();
}

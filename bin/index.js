#!/usr/bin/env node

const program = require('commander');

const { generateFromNpm, generateFromGit, generateInteractive } = require('../lib/actions');
const version = require('../package.json').version;

// function validateOrExit (validation) {
//   if (!validation) {
//     console.log("I'm here");
//     program.outputHelp();
//     process.exit(1);
//   }
// }

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
  .requiredOption('-r, --repository <repository>', 'Repository URL to be sued for bundle creation')
  .action(generateFromGit);

if (process.argv.length > 2) {
  program.parse(process.argv);
} else {
  generateInteractive();
}

// validateOrExit((program => )
//   program.rawArgs[2] === 'from-git'
//     ? program.args.length === 0
//     : program.args.length > 0,
// );

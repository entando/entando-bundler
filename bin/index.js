#!/usr/bin/env node

const program = require('commander');
const { generateBundle } = require('../lib/actions');
const version = require('../package.json').version;

function validateOrExit(validation) {
    if (!validation) {
        program.outputHelp();
        process.exit(1);
    }
}

program.storeOptionsAsProperties(false);
program.passCommandToAction(false);

program.version(version).name('entando-bundle');
program.description("A tool to interact with Entando's Digital-Exchange bundles")


program
    .command(`generate <module>`)
    .description(`Generates an Entando's Digital-Exchange bundle k8s custom resource`)
    .option('--thumbnail-file <thumb_file>', 'A file to use as a thumbnail for the bundle')
    .option('--thumbnail-url <thumb_url>', 'A URL hosting the image to use as a thumbnail for the bundle')
    .option(`--name <name>`, `The name to give to the EntandoDigitalExchangeBundle`)
    .option(`--namespace <namespace>`, `The namespace where the EntandoDigitalExchangeBundle will be created`)
    .option(`--registry <registry>`, `The registry to use for searching the module, by default uses the registry configured in your .npmrc`)
    .option(`--dry-run`, `Print the output instead of create the custom resource automatically`)
    .action(generateBundle);



// Is this actually required?
// program
//     .command('convert')
//     .description('Convert a JSON string retrieved from an npm view command into EntandoDigitalExchangeBundle custom resource')
//     .option('--json <json>', 'The input is a json string')
//     .option('--file <file>', 'The input is a file')
//     .option('--name <bundleName>', 'The name of the output EntandoDigitalExchangeBundle')
//     .option('--namespace <bundleNamespace>', 'The namespace of the generated EntandoDigitalExchangeBundle')
//     .action((cmdObj) => {
//         buildCustomResources(JSON.parse(cmdObj.json), cmdObj)
//     });

program.parse(process.argv);
validateOrExit(program.args.length > 0);

const program = require('commander');
const { generateBundle } = require('./lib/actions');
const version = require('./package.json').version;

function validateOrExit(validation) {
    if (!validation) {
        program.outputHelp();
        process.exit(1);
    }
}



program.version(version).name('@entando/de-cli');

program
    .command('generate <module>')
    .description('Generates an EntandoDigitalExchangeBundle custom resource')
    .option('--name <bundleName>', 'The name to give to the EntandoDigitalExchangeBundle')
    .option('--namespace <bundleNamespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
    .option('--registry <registry>', 'The registry to use for searching the module, by default uses the registry configured in your .npmrc')
    .option('--dry-run', 'Print the output instead of create the custom resource automatically')
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

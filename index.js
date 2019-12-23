const program = require('commander');
const registry = require('./modules/registry');
const {Bundle, Tag, Details} = require('./modules/models')
const _ = require('lodash');
const version = require('./package.json').version;
const yaml = require('js-yaml');

function validateOrExit(validation) {
    if (!validation) {
        program.outputHelp();
        process.exit(1);
    }
}

function generateModuleName(name, fallbackModule) {
    if (!name) {
        name = cleanModuleName(fallbackModule)
    }
    return name;
}

function cleanModuleName(module) {
    let name = module.name;
    if (name.startsWith('@')) {
        let scopeEnd = name.indexOf('/',0);
        name = name.substr(scopeEnd+1);
    }
    return name;
}

function generate(obj) {
    console.log(yaml.safeDump(obj));
}

function buildCustomResources(mods, options) {
    if (!_.isArray(mods)) {
        mods = [mods];
    }
    const name = generateModuleName(options.bundleName, mods[0]);
    const metadata = {
        'name': name,
        ...(options.bundleNamespace && { 'namespace': options.bundleNamespace })
    };
    const details = Details(mods[0]);
    const tags = mods.map(m => Tag(m))
        .filter(t => !_.isEmpty(t));
    generate(Bundle(metadata, details, tags), { 'dryRun': options.dryRun || false });
    return mods;
}

program.version(version).name('@entando/de-cli');

program
    .command('generate <module>')
    .description('Generates an EntandoDigitalExchangeBundle custom resource')
    .option('--name <bundleName>', 'The name to give to the EntandoDigitalExchangeBundle')
    .option('--namespace <bundleNamespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
    .options('--registry <registry>', 'The registry to use for searching the module', null, '')
    .action((module, cmdObj) => {
        registry.getBundleInfo({'name': module, 'registry':cmdObj.registry})
            .then(mods => {
                mods = buildCustomResources(mods, cmdObj);
            })
            .catch(err => console.error(`An error occurred while retrieving package ${m}`, err));
    });

program
    .command('convert')
    .description('Convert a JSON string retrieved from an npm view command into EntandoDigitalExchangeBundle custom resource')
    .option('--json <json>', 'The input is a json string')
    .option('--file <file>', 'The input is a file')
    .option('--name <bundleName>', 'The name of the output EntandoDigitalExchangeBundle')
    .option('--namespace <bundleNamespace>', 'The namespace of the generated EntandoDigitalExchangeBundle')
    .action((cmdObj) => {
        buildCustomResources(JSON.parse(cmdObj.json), cmdObj)
    });

program.parse(process.argv);
validateOrExit(program.args.length > 0);

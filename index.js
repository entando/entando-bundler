const program = require('commander');
const registry = require('./modules/registry');
const fs = require('fs');
const _ = require('lodash');
const version = require('./package.json').version;
const k8s = require('./modules/k8s');
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

function Bundle(metadata = {}, details = {}, tags = []) {
    return {
        'apiVersion': 'entando.org/v1alpha1',
        'kind': 'EntandoDeBundle',
        'metadata': metadata,
        'specs': {
            'details': details,
            'tags': tags
        }
    }
}

function Details(meta = {}) {
    let metadata = {};
    if (!_.isEmpty(meta)) {
        metadata = {
            "name": meta.name,
            "description": meta.description,
            "dist-tags": meta['dist-tags'] || '',
            "time": meta.time,
            "versions": meta.versions,
            "keywords": meta.keywords,
            "repository": meta.repository,
            "author": meta.author || '',
            "maintainers": meta.maintainers,
        };
    }
    return _.pickBy(metadata);
}

function Tag(meta = {}) { 
    let tag = {}
    if (!_.isEmpty(meta)) {
        tag = {
            'version': meta.version,
            ...meta.dist
        }
    }
    return _.pickBy(tag);
}

function generate(obj, opts = { "dryRun": true}) {
    if (opts.dryRun) {
        console.log(yaml.safeDump(obj));
    } else {
        fs.writeFileSync('Temp.yaml', yaml.safeDump(obj))
    }
}

program.version(version).name('@entando/de-cli');

program
    .command('generate <module>')
    .description('Generates an EntandoDigitalExchangeBundle custom resource')
    .option('--dry-run', 'Output the results without generating a file', null, false)
    .option('--name <bundleName>', 'The name to give to the EntandoDigitalExchangeBundle')
    .option('--namespace <bundleNamespace>', 'The namespace where the EntandoDigitalExchangeBundle will be created')
    .action((module, cmdObj) => {
        registry.getBundleInfo(module)
            .then(mods => {
                if (! _.isArray(mods)) {
                    mods = [mods]
                }
                const name = generateModuleName(cmdObj.bundleName, mods[0]);
                const metadata = {
                    'name': name,
                    ...(cmdObj.bundleNamespace && {'namespace': cmdObj.bundleNamespace})

                }
                const details = Details(mods[0]);
                const tags = mods.map(m => Tag(m))
                    .filter(t => !_.isEmpty(t));
                generate(Bundle(metadata, details, tags), {'dryRun': cmdObj.dryRun || false});
            })
            .catch(err => console.error(`An error occurred while retrieving package ${m}`, err));
    })


program.parse(process.argv);
validateOrExit(program.args.length > 0)
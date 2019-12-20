const program = require('commander');
const registry = require('./modules/registry');
const _ = require('lodash');
const version = require('./package.json').version;
const yaml = require('js-yaml');

function validateOrExit(validation) {
    if (!validation) {
        program.outputHelp();
        process.exit(1);
    }
}
function Bundle(metadata = {}, tags = []) {
    return {
        'apiVersion': 'entando.org/v1alpha1',
        'kind': 'EntandoDigitalExchangeBundle',
        'metadata': metadata,
        'specs': {
            'tags': tags
        }
        
    }
}

function Tag(meta = {}) { 
    tag = {}
    if (!_.isEmpty(meta)) {
        tag = {
            "name": meta.name,
            "description": meta.description,
            "version": meta.version,
            "keywords": meta.keywords,
            "repository": meta.repository,
            "dist": meta.dist,
            "author": meta.author || '',
            "maintainers": meta.maintainers,
        }
    }
    
    return _.pickBy(tag);
}

function printJson(obj) {
    console.log(yaml.dump(obj));
}

program.version(version).name('@entando/de-cli');

program
    .command('generate <module> [otherModules...]')
    .description('Generates an EntandoDigitalExchangeBundle custom resource')
    .option('--dry-run', 'Output the results without generating a file')
    .action((module, otherModules = [], cmdObj) => {
        let allModules = [ module, ...otherModules ]
        allModules.forEach(m => {
            registry.getBundleInfo(m)
                    .then(mods => {
                        if (! _.isArray(mods)) {
                            mods = [mods]
                        }
                        const metadata = {
                            "name": mods[0].name
                        }
                        const tags = mods.map(m => Tag(m))
                            .filter(t => !_.isEmpty(t));
                        printJson(Bundle(metadata, tags));
                    })
                    .catch(err => console.error(`An error occurred while retrieving package ${m}`, err));
        });
    })


program.parse(process.argv);
validateOrExit(program.args.length > 0)
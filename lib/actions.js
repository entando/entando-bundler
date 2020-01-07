const registry = require('./registry');
const k8s = require('./k8s');
const { convertToEntandoDeBundle } = require('./de_bundle');
const yaml = require('js-yaml');

function generate(obj, opts) {
    let output = yaml.safeDump(obj);
    if (opts.dryRun) {
        console.log(output);
    } else {
        k8s.create(obj, opts)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

function generateBundle(module, cmdObj) {
    registry.getBundleInfo({'name': module, 'registry':cmdObj.registry})
        .then(mods => {
            const entandoDeBundle = convertToEntandoDeBundle(mods, cmdObj);
            const options = {
                'dryRun': cmdObj.dryRun || false,
                ...(cmdObj.bundleNamespace && { 'namespace': options.bundleNamespace })
            }
            generate(entandoDeBundle, options);
        })
        .catch(err => console.error(`An error occurred while retrieving package ${module}`, err));
};

module.exports = {
    generateBundle
}
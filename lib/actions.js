const registry = require('./registry');
const k8s = require('./k8s');
const { convertToEntandoDeBundle } = require('./de_bundle');
const yaml = require('js-yaml');

function generate(obj, opts) {
    let output = yaml.safeDump(obj);
    if (opts.dryRun) {
        console.log(output);
    } else {
        k8s.apply(obj, opts)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

function generateBundle(module, options) {
    registry.getBundleInfo({'name': module, 'registry':options.registry})
        .then(mods => {
            convertToEntandoDeBundle(mods, options).then(entandoDeBundle => generate(entandoDeBundle, options));
        })
        .catch(err => {
            console.error(`An error occurred while generating bundle`);
            console.error(err);
        });
};

module.exports = {
    generateBundle
}
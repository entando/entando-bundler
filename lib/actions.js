const registry = require('./registry');
const repository = require('./repository');
const k8s = require('./k8s');
const { convertPackageToEntandoDeBundle, convertRepositoryToEntandoBundle } = require('./de_bundle');
const yaml = require('js-yaml');

function generate (obj, opts) {
  const output = yaml.safeDump(obj);
  if (opts.dryRun) {
    console.log(output);
  } else {
    k8s
      .apply(obj, opts)
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function generateRepositoryBundle (options) {
  repository
    .getBundleInfo(options)
    .then(bundle =>
      convertRepositoryToEntandoBundle(bundle, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(error => {
      console.error('An error occurred while generating bundle from git repository:');
      console.error(error);
    });
}

function generateBundle (module, options) {
  registry
    .getBundleInfo({ name: module, registry: options.registry })
    .then(mods =>
      convertPackageToEntandoDeBundle(mods, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(err => {
      console.error('An error occurred while generating bundle from npm package:');
      console.error(err);
    });
}

module.exports = {
  generateBundle,
  generateRepositoryBundle,
};

const npmBundler = require('./npm-bundler');
const gitBundler = require('./git-bundler');
const k8s = require('./k8s');
const { convertNpmModuleToEntandoDeBundle, convertGitRepositoryToEntandoDeBundle } = require('./de_bundle');
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

function generateFromGit (options) {
  gitBundler
    .getBundleInfo(options)
    .then(bundle =>
      convertGitRepositoryToEntandoDeBundle(bundle, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(error => {
      console.error('An error occurred while generating bundle from git repository:');
      console.error(error);
    });
}

function generateFromNpm (module, options) {
  npmBundler
    .getBundleInfo({ name: module, registry: options.registry })
    .then(mods =>
      convertNpmModuleToEntandoDeBundle(mods, options)
        .then((entandoDeBundle) => generate(entandoDeBundle, options)),
    )
    .catch(err => {
      console.error('An error occurred while generating bundle from npm package:');
      console.error(err);
    });
}

module.exports = {
  generateFromNpm,
  generateFromGit,
};

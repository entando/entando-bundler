const yaml = require('js-yaml');

const npmBundler = require('./npm-bundler');
const gitBundler = require('./git-bundler');
const k8s = require('./k8s');
const {
  convertNpmModuleToEntandoDeBundle,
  convertGitRepositoryToEntandoComponentBundle,
} = require('./de_bundle');

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
      convertGitRepositoryToEntandoComponentBundle(bundle, options)
        .then((entandoComponentBundle) => generate(entandoComponentBundle, options)),
    )
    .catch(error => {
      console.error('\x1b[31m', 'An error occurred while generating bundle from git repository:');
      console.error(error.message);
      process.exit(1);
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

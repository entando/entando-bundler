const _ = require('lodash');
const base64Img = require('base64-img');
const { EntandoDeBundle, EntandoComponentBundle, Tag, Details } = require('./models');

function validateModuleName (name) {
  const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm;
  return regex.test(name);
}

function generateModuleName (name, fallbackModule) {
  const moduleName = name || cleanModuleName(fallbackModule);

  if (!validateModuleName(moduleName)) {
    const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm;
    throw Error(`Module name ${name} is not valid, please provide a custom name that respects this regex ${regex}`);
  }
  return moduleName;
}

function cleanModuleName (module) {
  let name = module.name;
  if (name.startsWith('@')) {
    const scopeEnd = name.indexOf('/', 0);
    name = `${name.substr(1, scopeEnd - 1)}-${name.substr(scopeEnd + 1)}`;
  }
  return name;
}

async function generateThumbnail (options, fallbackModule) {
  return new Promise((resolve, reject) => {
    if (options.thumbnailFile) {
      base64Img.base64(options.thumbnailFile, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    } else if (options.thumbnailUrl) {
      base64Img.requestBase64(options.thumbnailUrl, (err, res, body) => {
        err ? reject(err) : resolve(body);
      });
    } else if (fallbackModule && fallbackModule.thumbnailFile) {
      base64Img.base64(fallbackModule.thumbnailFile, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    }
  });
}

async function convertGitRepositoryToEntandoComponentBundle (bundle) {
  return EntandoComponentBundle(bundle.metadata, bundle.spec, bundle.spec.tags);
}

async function convertNpmModuleToEntandoDeBundle (modules, options) {
  const modulesToConvert = Array.isArray(modules) ? modules : [modules];

  const detailsInfo = modulesToConvert[0];
  const name = generateModuleName(options.name, detailsInfo);
  const metadata = {
    name: name,
    ...(options.namespace && { namespace: options.namespace }),
  };
  if (options.thumbnailFile || options.thumbnailUrl) {
    detailsInfo.thumbnail = await generateThumbnail(options);
  }
  const details = Details(detailsInfo);
  const tags = modulesToConvert.map((m) => Tag(m)).filter((t) => !_.isEmpty(t));

  return EntandoDeBundle(metadata, details, tags);
}

module.exports = {
  validateModuleName,
  cleanModuleName,
  generateModuleName,
  generateThumbnail,
  convertGitRepositoryToEntandoComponentBundle,
  convertNpmModuleToEntandoDeBundle,
};

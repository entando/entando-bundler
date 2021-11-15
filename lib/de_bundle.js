const _ = require('lodash');
const base64Img = require('base64-img');
const { EntandoDeBundle, Tag, Details } = require('./models');

const bundleTypes = {
  SYSTEM_LEVEL_BUNDLE: 'system-level-bundle',
  STANDARD_BUNDLE: 'standard-bundle',
};

function validateModuleName(name) {
  const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm;
  return regex.test(name);
}

function generateModuleName (repository, reject) {
  const repoUrl = new URL(repository);

  // remove .git and split by /
  const urlTokens = repoUrl.pathname.replace('.git', '').split('/');

  // reverse
  const nameAndOrg = urlTokens.reverse().join('.');
  let id = nameAndOrg + repoUrl.hostname;

  // trim to 253 chars
  if (id.length > 253) {
    reject(new Error('The bundle resulting name is "' + id + '" but its size exceeds 253 characters'));
  }

  // remove possible leading and final dots
  id = (id.charAt(0) === '.') ? id.substring(1, id.length) : id;
  id = (id.charAt(id.length - 1) === '.') ? id.substring(0, id.length - 1) : id;

  return id;
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

async function convertGitRepositoryToEntandoDeBundle (bundle) {
  return EntandoDeBundle(bundle.metadata, bundle.spec.details, bundle.spec.tags);
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
  convertGitRepositoryToEntandoDeBundle,
  convertNpmModuleToEntandoDeBundle,
  bundleTypes: bundleTypes,
};

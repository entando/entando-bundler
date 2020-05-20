const { exec } = require('child_process');

function allModuleVersions (name) {
  const atSignIndex = name.lastIndexOf('@');
  if (atSignIndex > 0) {
    name = name.substring(0, atSignIndex);
  }
  return `${name}@*`;
}

function registryCmd (npmCommand, registry) {
  return registry ? `${npmCommand} --registry=${registry}` : npmCommand;
}

function getBundleInfo (obj = { name: '', registry: undefined }) {
  return new Promise((resolve, reject) => {
    const name = allModuleVersions(obj.name);
    const cmd = registryCmd(`npm view ${name} --json`, obj.registry);
    exec(cmd, { windowsHide: true }, (err, stdout, _stderr) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(stdout));
    });
  });
}

module.exports = {
  getBundleInfo,
  allModuleVersions,
};

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { exec } = require('child_process');
const { generateModuleName, generateThumbnail } = require('./de_bundle');

const CLONE_DIR_ROOT = '/tmp';
const CLONE_DIR = `tmp-ecr-bundle-repo_${new Date().getTime()}`;
const DESTINATION_DIR = path.join(CLONE_DIR_ROOT, CLONE_DIR);

function cloneRepository (options = {}) {
  const { repository } = options;

  return new Promise((resolve, reject) => {
    if (repository) {
      exec(
      `mkdir -p ${DESTINATION_DIR} && cd ${DESTINATION_DIR} && git clone -n ${repository} . --depth 1 && git checkout HEAD descriptor.yaml`,
      { windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        resolve();
      },
      );
    } else {
      reject(new Error('No repository option provided'));
    }
  });
}

// removing cloned repo and passing through the bundle
function removeRepository (bundle) {
  return new Promise((resolve, reject) => {
    exec(
      `rm -fr ${DESTINATION_DIR}`,
      { windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        resolve(bundle);
      },
    );
  });
}

function getDescriptorData (options) {
  const { repository, repositoryPath = '.' } = options;
  const workingPath = repository ? `${DESTINATION_DIR}` : repositoryPath;
  return fs.promises.readFile(`${workingPath}/descriptor.yaml`, 'utf8')
    .then(descriptorFile => yaml.parse(descriptorFile));
}

function getRepositoryData (options = {}) {
  const { repository, repositoryPath = '.' } = options;
  return new Promise((resolve, reject) => {
    const tagListPromise = new Promise((resolve, reject) => {
      const workingPath = repository ? `${DESTINATION_DIR}` : repositoryPath || null;
      exec(
        'git tag -l -i --sort=-v:refname',
        { windowsHide: true, cwd: workingPath },
        (err, stdout, stderr) => {
          err && reject(err);
          const tags = stdout.trim().split(/\r?\n/g);
          const filteredTags = tags.filter(tag => /^\d+\.\d+.\d+/.test(tag));
          resolve({
            latestTag: filteredTags[0],
            tags: filteredTags,
          });
        },
      );
    });

    const repositoryFetchUrlPromise = new Promise((resolve, reject) => {
      if (repository) {
        resolve(repository);
      } else {
        const workingPath = repository ? `${DESTINATION_DIR}` : repositoryPath || null;
        exec(
          'git remote get-url origin',
          { windowsHide: true, cwd: workingPath },
          (err, stdout, stderr) => { err ? reject(err) : resolve(stdout); },
        );
      }
    });

    Promise.all([tagListPromise, repositoryFetchUrlPromise])
      .then(([tagData, fetchUrl]) => resolve({ ...tagData, fetchUrl }))
      .catch(error => reject(error));
  });
}

function getTagCommit ({ repository, repositoryPath }, tag) {
  return new Promise((resolve, reject) => {
    const workingPath = repository ? `${DESTINATION_DIR}` : repositoryPath || null;
    exec(
      `git log -1 --format=%H ${tag}`,
      { windowsHide: true, cwd: workingPath },
      (err, stdout, stderr) => { err ? reject(err) : resolve({ tag, commitId: stdout.trim() }); },
    );
  });
}

function processRepository (options) {
  return new Promise((resolve, reject) => {
    const descriptorDataPromise = getDescriptorData(options);
    const repositoryDataPromise = getRepositoryData(options);

    Promise.all([descriptorDataPromise, repositoryDataPromise])
      .then(([descriptorData, repositoryData]) => {
        const tagsCommitIdPromises = repositoryData.tags.map(tag => getTagCommit(options, tag));

        const thumbnailPromise = (options.thumbnailFile || options.thumbnailUrl || descriptorData['thumbnail-file'])
          ? generateThumbnail(options, { thumbnailFile: descriptorData['thumbnail-file'] })
          : Promise.resolve();

        Promise.all([thumbnailPromise, ...tagsCommitIdPromises])
          .then(([thumbnail, ...tags]) => {
            const labels =
            descriptorData.components &&
            Object.keys(descriptorData.components)
              .reduce((acc, component) => ({ ...acc, labels: { ...acc.labels, [component]: 'true' } }), {});

            const bundleInfo = {
              metadata: {
                name: generateModuleName(options.name, { name: descriptorData.code }),
                ...(options.namespace ? { namespace: options.namespace } : {}),
                ...labels,
              },
              spec: {
                details: {
                  name: descriptorData.title || descriptorData.code,
                  description: descriptorData.description,
                  'dist-tags': {
                    latest: repositoryData.latestTag,
                  },
                  versions: repositoryData.tags,
                  ...(descriptorData.keywords ? { keywords: descriptorData.keywords.split(',') } : {}),
                  ...(thumbnail ? { thumbnail } : {}),
                },
                tags: tags.map(tagData => ({
                  version: tagData.tag,
                  shasum: tagData.commitId,
                  integrity: tagData.commitId,
                  tarball: repositoryData.fetchUrl,
                })),
              },
            };

            resolve(bundleInfo);
          });
      });
  });
}

function getBundleInfo (options) {
  const {
    repository,
  } = options;

  // if repository option is passed, git repository has to be cloned locally
  // else, use passed local repository path or working directory
  if (repository) {
    return cloneRepository(options)
      .then(() => processRepository(options))
      .then(bundle => removeRepository(bundle));
  } else {
    return processRepository(options);
  }
}

module.exports = {
  getBundleInfo,
  cloneRepository,
  removeRepository,
  getDescriptorData,
  getRepositoryData,
  processRepository,
};

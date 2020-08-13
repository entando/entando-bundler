const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const inquirer = require('inquirer');
const validUrl = require('valid-url');
const { exec } = require('child_process');
const { generateModuleName, generateThumbnail, validateModuleName} = require('./de_bundle');
const { generateFromGit } = require('./actions');

const CLONE_DIR_ROOT = '/tmp';
const CLONE_DIR = `tmp-ecr-bundle-repo_${new Date().getTime()}`;
const DESTINATION_DIR = path.join(CLONE_DIR_ROOT, CLONE_DIR);

function isValidPath (path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

function cloneRepository (options = {}) {
  const { repository } = options;

  return new Promise((resolve, reject) => {
    if (repository) {
      const opt = (process.platform === 'win32' || process.platform === 'win64') ? '' : '-p';
      exec(
      `mkdir ${opt} ${DESTINATION_DIR} && cd ${DESTINATION_DIR} && git clone -n ${repository} . && git checkout HEAD descriptor.yaml`,
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

function getDescriptorData () {
  function renameComponentType (componentType) {
    // component type names have to be renamed as different sources parse different component types
    const mapping = {
      plugins: 'plugin',
      widgets: 'widget',
      fragments: 'fragment',
      contentTypes: 'contentType',
      pageTemplates: 'pageTemplate',
      contentTemplates: 'contentTemplate',
      pageModels: 'pageTemplate', // renaming old nomenclature
      contentModels: 'contentTemplate', // renaming old nomenclature
    };
    return mapping[componentType] || componentType;
  }

  return fs.promises.readFile(`${DESTINATION_DIR}/descriptor.yaml`, 'utf8')
    .then(descriptorFile => yaml.parse(descriptorFile))
    .then(descriptorData => {
      const components = (Object.keys(descriptorData.components) || [])
        .reduce(
          (acc, componentType) => {
            const renamedComponentType = renameComponentType(componentType);
            return {
              ...acc,
              ...(Array.isArray(descriptorData.components[componentType])
                ? { [renamedComponentType]: descriptorData.components[componentType] }
                : {}),
            };
          },
          {},
        );

      return { ...descriptorData, components };
    });
}

function getRepositoryData (options = {}) {
  return new Promise((resolve, reject) => {
    exec(
      'git tag -l -i --sort=-v:refname',
      { windowsHide: true, cwd: DESTINATION_DIR },
      (err, stdout, stderr) => {
        err && reject(err);

        const { repository, tags = true } = options;

        const filteredTags = !tags
          ? []
          : stdout
            .trim()
            .split(/\r?\n/g)
            .filter(tag => /^v?\d+\.\d+.\d+/.test(tag));

        if (!filteredTags.length && tags) {
          reject(new Error(
            'No tags are available in the repository, please make sure tags matching ' +
            'semver syntax are available.\n' +
            'To create a bundle without tags, run the command with `--no-tags` option.',
          ));
        }
        resolve({
          latestTag: filteredTags[0],
          tags: filteredTags,
          fetchUrl: repository,
        });
      },
    );
  });
}

function getTagCommit ({ repository }, tag) {
  return new Promise((resolve, reject) => {
    exec(
      `git log -1 --format=%H ${tag}`,
      { windowsHide: true, cwd: DESTINATION_DIR },
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
                  'dist-tags':
                    repositoryData.latestTag
                      ? { latest: repositoryData.latestTag }
                      : {},
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
      })
      .catch(error => {
        console.error('\x1b[31m', error.message);
        process.exit(1);
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

const fromGitQuestions = [
  {
    type: 'input',
    name: 'repository',
    message: 'What\'s the git repository URL',
    validate: (answer) => {
      if (answer.startsWith('https://') && answer.endsWith('.git')) {
        return true;
      }
      return 'You need to provide a valid git repository URL, which should start with \'https://\' and and with \'.git\'';
    },
  },
  {
    type: 'list',
    name: 'thumbnail',
    message: 'Do you want to use a custom thumbnail for the bundle?',
    choices: [
      { value: 'no', name: 'I don\'t want to provide a thumbnail' },
      { value: 'thumbnailUrl', name: 'I want to provide a URL for the thumbnail' },
      { value: 'thumbnailFile', name: 'I want to provide a file path to the thumbnail' },
    ],
  },
  {
    when: (answers) => answers.thumbnail === 'thumbnailUrl',
    type: 'input',
    name: 'thumbnailUrl',
    message: 'Type the URL where to get the thumbnail',
    validate: (answer) => validUrl.isUri(answer) ? true : 'The provided url is not valid',
  },
  {
    when: (answers) => answers.thumbnail === 'thumbnailFile',
    type: 'input',
    name: 'thumbnailFile',
    message: 'Type the path to the thumbnail file',
    validate: (answer) => isValidPath(answer) ? true : 'The provided path doesn\'t exist',
  },
  {
    type: 'input',
    name: 'name',
    message: 'What name do you want to use for the generated custom-resource?',
    validate: (answer) => validateModuleName(answer) ? true : 'Module name is not valid based on this regex /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm',
  },
];

async function main () {
  answers = await inquirer.prompt(fromGitQuestions);
  generateFromGit(answers);
}

module.exports = {
  getBundleInfo,
  cloneRepository,
  removeRepository,
  getDescriptorData,
  getRepositoryData,
  processRepository,
  main
};

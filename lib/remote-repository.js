const nodeFetch = require('node-fetch');
const yaml = require('yaml');

function getServiceInfo (repository) {
  if (/git(?:hub|lab).com/i.test(repository)) {
    const [, service, owner, repo] = /(git(?:hub|lab)).com[:/]([^/]*)\/([^/]*)(?:\.git)?$/gi.exec(repository);
    return { service, owner, repo };
  }
  return { service: 'NOT_SUPPORTED' };
}

// getting repository reference (tag, release, branch or commit)
function fetchRemoteRepositoryReference (serviceInfo, { repository, latest, ref }) {
  return new Promise((resolve, reject) => {
    if (serviceInfo.service === 'github') {
      const { owner, repo } = serviceInfo;
      if (latest) {
        nodeFetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`)
          .then(response => response.json())
          .then(response => response.tag_name)
          .then(tagName => resolve(tagName));
      }
      if (ref) { resolve(ref); }
      resolve('master');
    } else {
      reject(new Error('Unsupported repository service.'));
    }
  });
}

function fetchRemoteDescriptor (serviceInfo, reference) {
  const { service, owner, repo } = serviceInfo;
  if (service === 'github') {
    return nodeFetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/descriptor.yaml?ref=${reference}`,
    ).then(response => response.json());
  }
}

function fetchRawRemoteDescriptor (serviceInfo, reference) {
  const { service, owner, repo } = serviceInfo;
  if (service === 'github') {
    console.log(`Fetching descriptor.yaml @ https://raw.githubusercontent.com/${owner}/${repo}/${reference}/descriptor.yaml`);

    return nodeFetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${reference}/descriptor.yaml`,
    )
      .then(res => res.buffer())
      .then(descriptorFileBuffer => {
        const descriptor = yaml.parse(descriptorFileBuffer.toString());
        console.log(descriptor);
        return descriptor;
        return {
          name: descriptor.code,
          description: descriptor.description || '',
          'dist-tags': meta['dist-tags'] || '',
          time: meta.time,
          versions: meta.versions,
          keywords: meta.keywords,
          repository: meta.repository,
          author: meta.author || '',
          maintainers: meta.maintainers,
          thumbnail: meta.thumbnail || '',
        };
      });
  }
}

function getBundleInfo (options) {
  if (options.source === 'remote') {
    const serviceInfo = getServiceInfo(options.repository);
    return fetchRemoteRepositoryReference(serviceInfo, options)
      .then(reference => fetchRawRemoteDescriptor(serviceInfo, reference))
      .then(descriptor => descriptor);
  }

  return Promise.reject(new Error('Unsupported repository source'));
}

module.exports = {
  getBundleInfo,
};
